/**
 * Width and height of a PNG or JPEG, read from its header.
 *
 * The Word renderer needs a logo's proportions to size it. Reading them here
 * costs a few bytes of parsing; an image library in the upload route would add
 * a native dependency to every request for the sake of two numbers.
 *
 * @returns {{ width: number, height: number } | null}
 */
export function imageSize(buf) {
  if (!buf || buf.length < 24) return null;

  // PNG: signature, then the IHDR chunk carries width and height at 16 and 20.
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // JPEG: walk the segments until a start-of-frame marker.
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let at = 2;
    while (at + 9 < buf.length) {
      if (buf[at] !== 0xff) return null;
      const marker = buf[at + 1];
      if (marker === 0xff) { at++; continue; }                       // fill byte
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { at += 2; continue; }
      const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isFrame) return { width: buf.readUInt16BE(at + 7), height: buf.readUInt16BE(at + 5) };
      at += 2 + buf.readUInt16BE(at + 2);
    }
  }
  return null;
}
