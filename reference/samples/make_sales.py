"""
Sample CV 6 of 6 - Sales and marketing (regional sales manager).

FICTIONAL. Invented person, invented employers, example.com email, Ofcom drama
range phone number (07700 900xxx).

Formatting hazard: NO SECTION HEADINGS AT ALL.

There is no "EXPERIENCE", no "EDUCATION", no bold, no bullets, no rules and no
change in font size below the name. Every job, the education, the skills and
the personal details are prose paragraphs in one continuous 9.5pt block, with
employers and dates buried mid-sentence ("...joined Northlake Beverages in
April 2021 as regional sales manager for the North West..."). Extractors that
segment a CV by looking for heading-shaped lines find nothing to anchor on and
either return one enormous blob in the summary field or hallucinate structure
that is not there.

The specific things to check in the output: that the four employers are
separated into four roles, that the education paragraph is not filed as a job,
and that the last paragraph's personal details do not end up in the profile.
"""

import os

import pymupdf

W, H = 595, 842
INK = (0.12, 0.12, 0.14)

ML, MR = 68, W - 68
TOP, BOTTOM = 74, H - 60

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "sales-regional-manager.pdf")

PARAGRAPHS = [
    "Ryan Castledine, 07700 900729, ryan.castledine@example.com, based in "
    "Warrington and happy to travel. Regional sales manager with eleven years "
    "selling into the licensed trade and grocery channels, currently responsible "
    "for a 14.6m territory and a team of seven field account managers.",

    "I joined Northlake Beverages Ltd in April 2021 as regional sales manager for "
    "the North West and have been there since. The patch was doing 11.2m when I "
    "took it and closed last financial year at 14.6m, which was 118 per cent to "
    "target and the strongest region in the business for two years running. I run "
    "seven field account managers and two telesales heads, and I own the P&L for "
    "the region including promotional spend of about 900k a year. The things I am "
    "proudest of are winning the Halbrook Inns account, which was a competitor "
    "stronghold for nine years and is worth 2.1m annually, and rebuilding the "
    "journey plans so that call rates went from 5.4 to 8.1 a day without adding "
    "headcount. I also sat on the national pricing committee and pushed through "
    "the change to volume-tiered rebates that the finance team had been asking "
    "for since 2019.",

    "Before that I was at Ardenway Packaging Group from July 2017 until March "
    "2021, first as a key account manager and then as senior key account manager "
    "from the start of 2019. I looked after eleven national accounts worth 6.8m "
    "combined, renegotiated the two largest contracts on improved margin at a "
    "point when raw material costs were moving weekly, and brought in three new "
    "logos in the ready meal sector. I was the account lead on the tender that "
    "won us the Craythorne Foods contract, a three-year deal worth 2.4m, and I "
    "wrote most of the submission myself.",

    "From 2014 to 2017 I worked at Verity Trade Supplies as a territory sales "
    "executive covering Greater Manchester and Cheshire, growing the territory 31 "
    "per cent over three years and finishing top of the national league table in "
    "my second and third years. I was promoted to senior executive in 2016 and "
    "given the two largest independents on the patch. Before that I spent two "
    "years at Kelmscott Office Solutions in a straightforward new business "
    "telesales role, 60 calls a day, which taught me more about resilience than "
    "anything since. That was 2012 to 2014.",

    "I studied business management at Brandthorpe University and graduated in "
    "2012 with a 2:1, having done a placement year at a drinks wholesaler which "
    "is what got me into the trade in the first place. Since then I have done the "
    "ISMM level 4 diploma in sales, a Miller Heiman strategic selling course in "
    "2019 and an internal leadership programme at Northlake across 2022 and 2023. "
    "I am comfortable in Salesforce, have used HubSpot and Pipedrive at previous "
    "employers, and build my own territory reporting in Excel and Power BI "
    "because the standard reports have never told me what I actually need to "
    "know.",

    "On a personal note I am 34, hold a full clean driving licence, and I am "
    "looking for a national accounts or head of sales role where the ceiling is "
    "higher than it is where I am now. I can be flexible on notice, which is "
    "currently three months but negotiable. References are available from my "
    "previous two employers and I would rather my current employer was not "
    "contacted until an offer is on the table. I coach an under-11s football team "
    "on Saturdays and completed the Manchester half marathon in 2024 in 1 hour "
    "52.",
]


def build(path=OUT):
    doc = pymupdf.open()
    page = doc.new_page(width=W, height=H)

    # The name is the only typographic signal in the document, and even that is
    # only 2.5pt larger than the body text.
    page.insert_text((ML, TOP), "Ryan Castledine", fontsize=12, fontname="helv",
                     color=INK)
    y = TOP + 18

    for p in PARAGRAPHS:
        rc = page.insert_textbox(
            pymupdf.Rect(ML, y, MR, BOTTOM), p,
            fontsize=9.5, fontname="helv", color=INK, align=0,
        )
        used = (BOTTOM - y) - rc
        y += used + 11

    doc.save(path)
    doc.close()
    return path


if __name__ == "__main__":
    print(f"wrote {build()}")
