import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Venditas — candidate CVs in your template, with the contact details stripped';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * The image that appears when someone pastes the link into Slack, LinkedIn or
 * WhatsApp. Without it those platforms render a grey box, which reads as an
 * unfinished site — and this link will mostly be shared by a recruiter passing
 * it to a colleague, which is exactly the moment it needs to look real.
 *
 * Generated rather than a static file so it can never drift out of sync with
 * the positioning it quotes.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f6f7f9',
          padding: '68px 76px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: '#33418f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: 20, height: 26, borderRadius: 3, background: '#fff' }} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, color: '#151b26', letterSpacing: -0.6 }}>
            Venditas
          </div>
          <div
            style={{
              fontSize: 16,
              color: '#78838f',
              letterSpacing: 2,
              textTransform: 'uppercase',
              fontFamily: 'system-ui, sans-serif',
              marginTop: 6,
            }}
          >
            for recruitment agencies
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 62,
              lineHeight: 1.08,
              color: '#151b26',
              letterSpacing: -1.8,
              maxWidth: 940,
            }}
          >
            Candidate CVs in your template, with the contact details stripped.
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#4a5464',
              marginTop: 26,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Four seconds. Ten free, no card.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 21,
            color: '#33418f',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ width: 40, height: 3, background: '#33418f' }} />
          venditas.in
        </div>
      </div>
    ),
    size
  );
}
