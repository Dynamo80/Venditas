"""
Sample CV 4 of 6 - Engineering and manufacturing (senior process engineer).

FICTIONAL. Invented person, invented employers, example.com email, Ofcom drama
range phone number (07700 900xxx).

Formatting hazard: INCONSISTENT DATE FORMATS within one document.

Nine different conventions appear, several of them ambiguous, in a layout that
is otherwise clean - so any date failure is unambiguously a date failure and
not a knock-on from broken extraction:

    March 2022 - Present          Sep 2017 to Jun 2019
    07/2019 - 06/2021             01.09.2012 - 31.08.2015
    2015-17                       Jan '11 - Aug '12
    Summer 2010                   2019 (Aug) to 2021 (Jun)
    from 3rd October 2011         Oct 2010 - Jun 2011

Two of the ranges deliberately overlap in real time but are written in
different notations, so an extractor that normalises them will surface the
overlap and one that does not will pass it through. "07/2019" is also a
UK/US ambiguity trap: it must be read as July 2019, not 7 January 2019.
"""

import os

import pymupdf

W, H = 595, 842
INK = (0.10, 0.10, 0.12)
MUTED = (0.42, 0.45, 0.50)
ACCENT = (0.48, 0.28, 0.08)
RULE = (0.78, 0.78, 0.80)

ML, MR = 54, W - 54

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "engineering-process-engineer.pdf")


def build(path=OUT):
    doc = pymupdf.open()
    page = doc.new_page(width=W, height=H)

    def text(x, y, s, size=9, font="helv", color=INK, width=None):
        if width:
            rc = page.insert_textbox(
                pymupdf.Rect(x, y, x + width, y + 500), s,
                fontsize=size, fontname=font, color=color, align=0,
            )
            return y + (500 - rc if rc > 0 else 14)
        page.insert_text((x, y), s, fontsize=size, fontname=font, color=color)
        return y + size + 4

    def heading(y, label):
        y += 6
        y = text(ML, y, label, 9, "hebo", ACCENT)
        page.draw_line(pymupdf.Point(ML, y - 1), pymupdf.Point(MR, y - 1),
                       color=RULE, width=0.6)
        return y + 6

    colw = MR - ML
    y = 58

    y = text(ML, y, "STUART BALGOWNIE", 17, "hebo")
    y = text(ML, y + 1, "CEng MIChemE  -  Senior Process Engineer", 10.5, "helv", ACCENT)
    y += 4
    y = text(ML, y, "stuart.balgownie@example.com  |  07700 900534  |  "
             "Stockton-on-Tees TS18  |  full clean licence, CCNSG passport",
             8.5, "helv", MUTED)
    y += 12

    y = heading(y, "PROFILE")
    y = text(ML, y,
             "Chartered process engineer, fifteen years across specialty polymers, "
             "food ingredients and water treatment. Split roughly evenly between "
             "plant-side troubleshooting and capital project delivery, with three "
             "COMAH top-tier sites in the history. Comfortable owning a HAZOP "
             "action list from close-out through to commissioning.",
             9, "helv", INK, width=colw)
    y += 12

    y = heading(y, "EMPLOYMENT")

    jobs = [
        ("Norvale Polymers Ltd, Teesside", "Senior Process Engineer",
         "March 2022 - Present",
         ["Technical authority for two continuous polymerisation trains "
          "(combined 46 kt/yr). Chair HAZOP and LOPA studies and own the "
          "resulting action register.",
          "Delivered a 3.4m debottlenecking project from FEED to handover two "
          "weeks early; nameplate throughput up 12% with no additional emissions "
          "permit variation required.",
          "Cut steam consumption 9% by re-rating the devolatiliser condenser duty "
          "and retuning the vacuum system - payback in seven months."]),
        ("Ellermore Process Solutions (contract)", "Process Engineer, EPC projects",
         "07/2019 - 06/2021",
         ["Client-side process design on two water treatment upgrades; P&ID "
          "development, line sizing, relief valve sizing to API 520/521.",
          "Wrote the operating philosophy and commissioning test packs for a "
          "sequencing batch reactor plant."]),
        ("Castleforth Precision Systems", "Manufacturing / Process Engineer",
         "Sep 2017 to Jun 2019",
         ["Six Sigma Green Belt project on an extrusion line: scrap from 6.8% to "
          "2.1%, annualised saving around 210k.",
          "Introduced SPC charting on four cells; trained 22 operators."]),
        ("Aldercrest Ingredients plc", "Process Engineer (secondment, then permanent)",
         "2015-17",
         ["Spray drying and evaporation plant. Owned the CIP validation programme "
          "across three dryers."]),
        ("Bewick Marine Fabrication", "Graduate Engineer, rotational",
         "01.09.2012 - 31.08.2015",
         ["Four six-month rotations: design office, production, QA and planning; "
          "confirmed into the design office from 3rd October 2011."]),
        ("Thorne & Askwith Ltd", "Industrial placement engineer",
         "Jan '11 - Aug '12",
         ["Placement year extended to twenty months at the company's request."]),
        ("Hartlow Brewing Co", "Summer engineering assistant",
         "Summer 2010", []),
    ]

    for employer, title, dates, bullets in jobs:
        y = text(ML, y, employer, 9.5, "hebo")
        y = text(ML, y - 1, title + "   |   " + dates, 8.8, "heit", MUTED)
        y += 1
        for b in bullets:
            y = text(ML + 10, y, "- " + b, 8.4, "helv", INK, width=colw - 10)
            y += 1
        y += 6

    y = heading(y, "EDUCATION AND PROFESSIONAL")
    rows = [
        ("MEng Chemical Engineering, University of Calderbridge",
         "2006 - 2010, first class"),
        ("MSc Process Safety (part-time, completed)", "Oct 2010 - Jun 2011"),
        ("Chartered Engineer, IChemE", "registered 2019 (Aug) to present"),
        ("IOSH Managing Safely; NEBOSH General Certificate",
         "2018 and 2013 respectively"),
    ]
    for line, sub in rows:
        y = text(ML, y, line + "  -  " + sub, 8.6, "helv")
        y += 1
    y += 2

    y = heading(y, "TECHNICAL")
    y = text(ML, y,
             "Aspen HYSYS, Aspen Plus (basic), AutoCAD P&ID, SolidWorks (basic), "
             "PHA-Pro, Minitab, Ignition SCADA, Allen-Bradley PLC read-only. "
             "DSEAR, ATEX, COMAH safety report contribution, PUWER assessments.",
             8.5, "helv", INK, width=colw)

    doc.save(path)
    doc.close()
    return path


if __name__ == "__main__":
    print(f"wrote {build()}")
