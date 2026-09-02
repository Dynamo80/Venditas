"""
Generate a deliberately awkward CV PDF for testing.

A tidy single-column CV proves nothing — every parser handles those. Real
candidate CVs arrive as two-column layouts with sidebars, which is exactly what
breaks naive text extraction: read the page in reading order and the sidebar
interleaves itself line-by-line into the work history.

So the sample has the things that actually cause failures:
  - a coloured sidebar column with contact details and skills
  - dates in three different formats, including an open-ended one
  - a header and footer that must not end up in the extracted content
  - a job title on a separate line from its employer
  - a bulleted achievement that wraps across lines
"""

import pymupdf

W, H = 595, 842  # A4 points
SIDEBAR_W = 190
INK = (0.09, 0.10, 0.12)
MUTED = (0.42, 0.45, 0.50)
SIDE_BG = (0.94, 0.95, 0.96)
ACCENT = (0.05, 0.35, 0.45)


def build(path="samples/messy-cv.pdf"):
    doc = pymupdf.open()
    page = doc.new_page(width=W, height=H)

    page.draw_rect(pymupdf.Rect(0, 0, SIDEBAR_W, H), color=None, fill=SIDE_BG)

    def text(x, y, s, size=9, font="helv", color=INK, width=None):
        if width:
            rc = page.insert_textbox(
                pymupdf.Rect(x, y, x + width, y + 400), s,
                fontsize=size, fontname=font, color=color, align=0,
            )
            return y + (400 - rc if rc > 0 else 14)
        page.insert_text((x, y), s, fontsize=size, fontname=font, color=color)
        return y + size + 4

    # ---- header and footer: must be stripped, not treated as content --------
    text(SIDEBAR_W + 24, 28, "CONFIDENTIAL - candidate supplied document", 7, "helv", MUTED)
    text(SIDEBAR_W + 24, H - 26, "Page 1 of 1  |  generated 02/09/2026", 7, "helv", MUTED)

    # ---- sidebar -----------------------------------------------------------
    y = 60
    y = text(20, y, "CONTACT", 8, "hebo", ACCENT)
    y += 4
    for line in [
        "priya.raghunathan",
        "@gmail.com",
        "+44 7700 900412",
        "Manchester, UK",
        "linkedin.com/in/",
        "priyaraghunathan",
    ]:
        y = text(20, y, line, 8, "helv", MUTED)

    y += 16
    y = text(20, y, "SKILLS", 8, "hebo", ACCENT)
    y += 4
    for s in ["Python", "SQL / Postgres", "Airflow", "dbt", "AWS (Redshift, S3)",
              "Tableau", "Stakeholder mgmt"]:
        y = text(20, y, s, 8, "helv", MUTED)

    y += 16
    y = text(20, y, "LANGUAGES", 8, "hebo", ACCENT)
    y += 4
    for s in ["English (native)", "Tamil (fluent)", "German (B1)"]:
        y = text(20, y, s, 8, "helv", MUTED)

    # ---- main column -------------------------------------------------------
    x = SIDEBAR_W + 24
    colw = W - x - 40
    y = 64

    y = text(x, y, "Priya Raghunathan", 19, "hebo")
    y = text(x, y + 2, "Senior Data Engineer", 11, "helv", ACCENT)
    y += 12

    y = text(x, y, "PROFILE", 8.5, "hebo", ACCENT)
    y += 6
    y = text(
        x, y,
        "Data engineer with eight years building batch and streaming pipelines in "
        "regulated environments. Led the migration of a 40TB on-premise warehouse to "
        "Redshift with no reported data loss.",
        9, "helv", INK, width=colw,
    )
    y += 10

    y = text(x, y, "EXPERIENCE", 8.5, "hebo", ACCENT)
    y += 8

    # Employer and title on separate lines, three date formats, one still open.
    jobs = [
        ("Nationwide Building Society", "Senior Data Engineer", "March 2022 - Present",
         ["Rebuilt the nightly regulatory reporting pipeline, cutting runtime from "
          "6 hours to 40 minutes and removing a recurring SLA breach that had been "
          "flagged twice by internal audit.",
          "Mentored three junior engineers; two promoted within eighteen months."]),
        ("Auto Trader UK", "Data Engineer", "07/2019 - 02/2022",
         ["Owned the event ingestion layer handling ~120M events daily.",
          "Introduced dbt, reducing model duplication across four analytics teams."]),
        ("Kantar", "Analyst (Data)", "Sep 2017 to Jun 2019",
         ["Built automated survey weighting in Python, replacing a manual Excel process."]),
    ]

    for employer, title, dates, bullets in jobs:
        y = text(x, y, employer, 10, "hebo")
        y = text(x, y - 1, title, 9, "heit", MUTED)
        y = text(x, y - 2, dates, 8, "helv", MUTED)
        y += 3
        for b in bullets:
            y = text(x + 10, y, "- " + b, 8.5, "helv", INK, width=colw - 10)
            y += 1
        y += 8

    y = text(x, y, "EDUCATION", 8.5, "hebo", ACCENT)
    y += 6
    y = text(x, y, "BSc Mathematics, University of Warwick", 9, "helv")
    y = text(x, y - 2, "2014 - 2017, First Class Honours", 8, "helv", MUTED)

    doc.save(path)
    doc.close()
    return path


if __name__ == "__main__":
    p = build()
    print(f"wrote {p}")
