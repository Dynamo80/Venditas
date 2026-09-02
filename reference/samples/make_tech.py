"""
Sample CV 1 of 6 - Technology (senior backend engineer).

FICTIONAL. Invented person, invented employers, example.com email, Ofcom drama
range phone number (07700 900xxx).

Formatting hazard: RIGHT-HAND SIDEBAR two-column layout, plus an email address
that splits across two lines.

The sidebar sits on the right, which is worse than a left sidebar for naive
extraction: PyMuPDF's reading order tends to emit the narrow column's lines
interleaved between the wide column's lines, so "Go / PostgreSQL / Kafka" ends
up wedged inside a job description. The contact block is narrower than the
address it holds, so "devansh.kulkarni" and "@example.com" land on separate
lines and only rejoin if something is deliberately stitching them back
together. A parser that takes the first email-looking token gets nothing, and a
model that is told never to invent should return the address whole or not at
all - both are informative.
"""

import os

import pymupdf

W, H = 595, 842  # A4 points
SIDEBAR_W = 178
SIDEBAR_X = W - SIDEBAR_W
INK = (0.10, 0.11, 0.13)
MUTED = (0.44, 0.47, 0.52)
SIDE_BG = (0.13, 0.17, 0.23)
SIDE_INK = (0.88, 0.90, 0.93)
ACCENT = (0.11, 0.42, 0.58)
SIDE_ACCENT = (0.55, 0.78, 0.90)

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "tech-backend-engineer.pdf")


def build(path=OUT):
    doc = pymupdf.open()
    page = doc.new_page(width=W, height=H)

    # Dark sidebar on the RIGHT.
    page.draw_rect(pymupdf.Rect(SIDEBAR_X, 0, W, H), color=None, fill=SIDE_BG)

    def text(x, y, s, size=9, font="helv", color=INK, width=None):
        if width:
            rc = page.insert_textbox(
                pymupdf.Rect(x, y, x + width, y + 500), s,
                fontsize=size, fontname=font, color=color, align=0,
            )
            return y + (500 - rc if rc > 0 else 14)
        page.insert_text((x, y), s, fontsize=size, fontname=font, color=color)
        return y + size + 4

    # ---- sidebar -----------------------------------------------------------
    sx = SIDEBAR_X + 16
    sw = SIDEBAR_W - 32
    y = 56

    y = text(sx, y, "CONTACT", 8, "hebo", SIDE_ACCENT)
    y += 5
    # Deliberately too narrow for the address: it wraps mid-token.
    for line in [
        "devansh.kulkarni",
        "@example.com",
        "07700 900318",
        "Bristol BS6",
        "github.com/",
        "dkulkarni-dev",
    ]:
        y = text(sx, y, line, 8, "helv", SIDE_INK)

    y += 18
    y = text(sx, y, "TECHNICAL", 8, "hebo", SIDE_ACCENT)
    y += 5
    for s in ["Go, Python, Kotlin", "PostgreSQL, Redis", "Kafka, RabbitMQ",
              "gRPC / protobuf", "Kubernetes, Helm", "Terraform", "AWS (EKS, RDS,",
              "SQS, Lambda)", "OpenTelemetry", "Event sourcing", "Trunk-based dev"]:
        y = text(sx, y, s, 8, "helv", SIDE_INK)

    y += 18
    y = text(sx, y, "CERTIFICATION", 8, "hebo", SIDE_ACCENT)
    y += 5
    for s in ["CKA - Certified", "Kubernetes Admin", "(2024)", "",
              "AWS SA Associate", "(lapsed 2023)"]:
        y = text(sx, y, s, 8, "helv", SIDE_INK)

    y += 18
    y = text(sx, y, "ELIGIBILITY", 8, "hebo", SIDE_ACCENT)
    y += 5
    for s in ["British citizen", "No sponsorship", "required", "",
              "Notice: 1 month"]:
        y = text(sx, y, s, 8, "helv", SIDE_INK)

    # ---- main column -------------------------------------------------------
    x = 44
    colw = SIDEBAR_X - x - 26
    y = 62

    y = text(x, y, "Devansh Kulkarni", 20, "hebo")
    y = text(x, y + 1, "Senior Backend Engineer", 11.5, "helv", ACCENT)
    y += 14

    y = text(x, y, "PROFILE", 8.5, "hebo", ACCENT)
    page.draw_line(pymupdf.Point(x, y + 1), pymupdf.Point(x + colw, y + 1),
                   color=ACCENT, width=0.5)
    y += 9
    y = text(
        x, y,
        "Backend engineer with nine years on high-throughput transactional systems, "
        "most recently owning the ledger and settlement services behind a card "
        "acquiring platform processing around 4.2 million authorisations a month. "
        "Comfortable being the person on call for the thing that must not lose money.",
        9, "helv", INK, width=colw,
    )
    y += 12

    y = text(x, y, "EXPERIENCE", 8.5, "hebo", ACCENT)
    page.draw_line(pymupdf.Point(x, y + 1), pymupdf.Point(x + colw, y + 1),
                   color=ACCENT, width=0.5)
    y += 11

    jobs = [
        ("Halloway Digital Ltd", "Senior Backend Engineer", "January 2023 - Present",
         ["Own the double-entry ledger service in Go: 4.2M authorisations/month, "
          "p99 write latency held under 45ms through two Black Fridays.",
          "Led the move from a shared Postgres instance to per-service databases "
          "with change-data-capture into Kafka, retiring 31 cross-schema joins.",
          "Introduced contract testing between eleven services, which cut "
          "integration-environment breakages from roughly weekly to two in a year."]),
        ("Brightmoor Payments Ltd", "Backend Engineer, Payments Core",
         "08/2020 - 12/2022",
         ["Built the idempotency and retry layer for a scheme-facing API; "
          "eliminated a duplicate-capture defect that had cost the business "
          "around 60k in refunds over the prior year.",
          "On-call rota lead. Rewrote the runbooks nobody had read."]),
        ("Cindermill Labs", "Software Engineer", "Mar 2017 to Jul 2020",
         ["Python and Django on a logistics tracking product; scaled the webhook "
          "fan-out from 200k to 9M deliveries a day.",
          "First engineer on the team to ship anything into Kubernetes."]),
        ("Vexley Retail Group", "Graduate Software Developer", "2015 - 2017",
         ["Maintained a legacy stock-allocation batch job written in Perl."]),
    ]

    for employer, title, dates, bullets in jobs:
        y = text(x, y, employer, 10, "hebo")
        y = text(x, y - 1, title, 9, "heit", MUTED)
        y = text(x, y - 2, dates, 8, "helv", MUTED)
        y += 3
        for b in bullets:
            y = text(x + 10, y, "- " + b, 8.5, "helv", INK, width=colw - 10)
            y += 1
        y += 9

    y += 2
    y = text(x, y, "EDUCATION", 8.5, "hebo", ACCENT)
    page.draw_line(pymupdf.Point(x, y + 1), pymupdf.Point(x + colw, y + 1),
                   color=ACCENT, width=0.5)
    y += 9
    y = text(x, y, "BSc (Hons) Computer Science, Kesterwick University", 9, "hebo")
    y = text(x, y - 2, "2012 - 2015, 2:1", 8, "helv", MUTED)
    y += 10

    y = text(x, y, "OPEN SOURCE AND WRITING", 8.5, "hebo", ACCENT)
    page.draw_line(pymupdf.Point(x, y + 1), pymupdf.Point(x + colw, y + 1),
                   color=ACCENT, width=0.5)
    y += 9
    for b in [
        "Maintainer of ledgerfmt, a small Go library for ISO 20022 message "
        "validation (about 900 stars, used by two payment institutions I know of).",
        "Wrote up the Postgres advisory-lock pattern behind our settlement "
        "scheduler; it is the most-read post on the Halloway engineering blog.",
        "Speaker, Bristol Backend Meetup - 'Idempotency is not a header' (2024).",
    ]:
        y = text(x + 10, y, "- " + b, 8.5, "helv", INK, width=colw - 10)
        y += 1
    y += 10

    y = text(x, y, "REFERENCES", 8.5, "hebo", ACCENT)
    page.draw_line(pymupdf.Point(x, y + 1), pymupdf.Point(x + colw, y + 1),
                   color=ACCENT, width=0.5)
    y += 9
    y = text(x, y, "Available on request. Please do not contact Halloway "
             "Digital before offer stage.", 8.5, "helv", INK, width=colw)

    doc.save(path)
    doc.close()
    return path


if __name__ == "__main__":
    print(f"wrote {build()}")
