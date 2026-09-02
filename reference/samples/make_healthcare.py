"""
Sample CV 3 of 6 - Healthcare (senior theatre nurse / scrub practitioner).

FICTIONAL. Invented person, invented hospitals and trusts, example.com email,
Ofcom drama range phone number (07700 900xxx). The NMC PIN is not a real PIN.

Formatting hazard: HEADER AND FOOTER PAGE FURNITURE on every page.

Two pages, each carrying a running header (name, PIN, document title) and a
three-part footer (a Windows file path, a page-x-of-y counter and a
confidentiality strip), separated from the body by rules. This is what a CV
looks like after somebody used a Word template with headers switched on. The
failure it hunts for is furniture leaking into content: a job history that ends
with "Page 1 of 2", a profile that opens with "CURRICULUM VITAE", or the file
path being read as an address. It repeats the candidate's name six times, so a
redacting renderer has six chances to miss one.
"""

import os

import pymupdf

W, H = 595, 842
INK = (0.09, 0.10, 0.12)
MUTED = (0.45, 0.48, 0.53)
FURNITURE = (0.55, 0.57, 0.62)
RULE = (0.70, 0.73, 0.77)
ACCENT = (0.10, 0.36, 0.34)

ML, MR = 56, W - 56
BODY_TOP = 92
BODY_BOTTOM = H - 74

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "healthcare-theatre-nurse.pdf")


def build(path=OUT):
    doc = pymupdf.open()
    pages = []

    def new_page(n, total=2):
        page = doc.new_page(width=W, height=H)
        pages.append(page)
        # ---- running header ------------------------------------------------
        page.insert_text((ML, 40), "CURRICULUM VITAE", fontsize=7.5,
                         fontname="hebo", color=FURNITURE)
        page.insert_text((ML, 52), "G. A. Oyelaran  |  NMC PIN 22X9999Z  |  "
                         "Theatre / Perioperative", fontsize=7.5,
                         fontname="helv", color=FURNITURE)
        page.insert_text((MR - 92, 46), "Updated 14/08/2026", fontsize=7.5,
                         fontname="helv", color=FURNITURE)
        page.draw_line(pymupdf.Point(ML, 60), pymupdf.Point(MR, 60),
                       color=RULE, width=0.5)
        # ---- running footer ------------------------------------------------
        page.draw_line(pymupdf.Point(ML, H - 58), pymupdf.Point(MR, H - 58),
                       color=RULE, width=0.5)
        page.insert_text((ML, H - 46),
                         r"C:\Users\grace\Documents\Job hunt 2026\Grace CV v7 FINAL (2).docx",
                         fontsize=6.5, fontname="helv", color=FURNITURE)
        page.insert_text((MR - 58, H - 46), f"Page {n} of {total}",
                         fontsize=6.5, fontname="helv", color=FURNITURE)
        page.insert_text((ML, H - 34),
                         "PRIVATE AND CONFIDENTIAL - not to be circulated without "
                         "the candidate's written consent",
                         fontsize=6.5, fontname="heit", color=FURNITURE)
        return page

    state = {"page": None}

    def text(x, y, s, size=9, font="helv", color=INK, width=None):
        page = state["page"]
        if width:
            rc = page.insert_textbox(
                pymupdf.Rect(x, y, x + width, y + 500), s,
                fontsize=size, fontname=font, color=color, align=0,
            )
            return y + (500 - rc if rc > 0 else 14)
        page.insert_text((x, y), s, fontsize=size, fontname=font, color=color)
        return y + size + 4

    def heading(y, label):
        y = text(ML, y, label, 9, "hebo", ACCENT)
        state["page"].draw_line(pymupdf.Point(ML, y - 1),
                                pymupdf.Point(MR, y - 1), color=ACCENT, width=0.4)
        return y + 8

    colw = MR - ML

    # ======================= page 1 =========================================
    state["page"] = new_page(1)
    y = BODY_TOP

    y = text(ML, y, "Grace Adeyinka Oyelaran", 18, "hebo")
    y = text(ML, y + 1, "Senior Theatre Nurse (Scrub / Circulating) - Band 6",
             10.5, "helv", ACCENT)
    y += 4
    y = text(ML, y, "grace.oyelaran@example.com  -  07700 900861  -  Nottingham NG7",
             8.5, "helv", MUTED)
    y = text(ML, y - 2, "NMC registration 22X9999Z, revalidation due March 2027",
             8.5, "helv", MUTED)
    y += 10

    y = heading(y, "PROFILE")
    y = text(ML, y,
             "Perioperative nurse with eleven years in theatres, nine of them "
             "scrubbing for orthopaedic and general surgery lists. Currently "
             "co-ordinating a four-theatre elective suite and acting as link nurse "
             "for surgical site infection surveillance. Calm in an unplanned "
             "conversion to open, and the person the list runs late without.",
             9, "helv", INK, width=colw)
    y += 10

    y = heading(y, "CLINICAL SPECIALTIES")
    for line in [
        "Scrub: primary and revision hip and knee arthroplasty, laparoscopic "
        "cholecystectomy and hernia repair, emergency laparotomy.",
        "Circulating and anaesthetic assistance across trauma and elective lists.",
        "Competent with Stryker and arthroscopy stacks, laminar flow protocols, "
        "tourniquet management and cell salvage set-up.",
        "Mentorship and practice assessor for student nurses and ODP trainees.",
    ]:
        y = text(ML + 10, y, "- " + line, 8.5, "helv", INK, width=colw - 10)
        y += 2
    y += 8

    y = heading(y, "CLINICAL EXPERIENCE")

    y = text(ML, y, "Kingsmere Private Hospital, Nottingham", 10, "hebo")
    y = text(ML, y - 1, "Senior Theatre Practitioner / Team Leader (Band 6 equivalent)",
             9, "heit", MUTED)
    y = text(ML, y - 2, "April 2022 - present", 8, "helv", MUTED)
    y += 3
    for b in [
        "Co-ordinate a four-theatre elective suite: daily staffing, skill mix and "
        "list order for orthopaedics, general surgery and ophthalmology.",
        "Reduced first-case-of-day late starts from 38% to 11% over two quarters by "
        "moving the WHO team brief to 07:40 and pre-checking implant availability.",
        "SSI surveillance link nurse; produced the quarterly return and led the "
        "practice change after a cluster of three superficial infections.",
        "Practice assessor for six student nurses and two trainee ODPs.",
    ]:
        y = text(ML + 10, y, "- " + b, 8.5, "helv", INK, width=colw - 10)
        y += 1
    y += 9

    y = text(ML, y, "St Aldwyn's Hospital NHS Foundation Trust", 10, "hebo")
    y = text(ML, y - 1, "Staff Nurse, Theatres (Band 5, Band 6 from 2019)", 9, "heit", MUTED)
    y = text(ML, y - 2, "September 2016 - March 2022", 8, "helv", MUTED)
    y += 3
    for b in [
        "Scrubbed across trauma, general and vascular lists including out-of-hours "
        "emergency theatre on a 1-in-5 on-call rota.",
        "Member of the trust's swab, instrument and needle count working group "
        "following a never event in a neighbouring directorate.",
        "Covered recovery during the 2020-21 escalation and completed the trust's "
        "critical care surge training.",
    ]:
        y = text(ML + 10, y, "- " + b, 8.5, "helv", INK, width=colw - 10)
        y += 1

    # ======================= page 2 =========================================
    state["page"] = new_page(2)
    y = BODY_TOP

    y = text(ML, y, "Brackenhill Day Surgery Unit", 10, "hebo")
    y = text(ML, y - 1, "Staff Nurse (Band 5)", 9, "heit", MUTED)
    y = text(ML, y - 2, "Jan 2015 to Aug 2016", 8, "helv", MUTED)
    y += 3
    for b in [
        "Day-case ophthalmology and minor general surgery; scrub and recovery.",
        "Completed the local scrub competency framework within nine months.",
    ]:
        y = text(ML + 10, y, "- " + b, 8.5, "helv", INK, width=colw - 10)
        y += 1
    y += 9

    y = text(ML, y, "Meadowbank Care Home", 10, "hebo")
    y = text(ML, y - 1, "Registered Nurse (bank)", 9, "heit", MUTED)
    y = text(ML, y - 2, "2014 - 2015", 8, "helv", MUTED)
    y += 3
    y = text(ML + 10, y, "- Bank shifts alongside preceptorship; medicines "
             "management and end-of-life care.", 8.5, "helv", INK, width=colw - 10)
    y += 12

    y = heading(y, "EDUCATION AND REGISTRATION")
    for line, sub in [
        ("BSc (Hons) Adult Nursing, University of Fernleigh", "2011 - 2014, 2:1"),
        ("NMC registered nurse, adult (sub part 1)", "PIN 22X9999Z, first registered October 2014"),
    ]:
        y = text(ML, y, line, 9, "hebo")
        y = text(ML, y - 2, sub, 8, "helv", MUTED)
        y += 4
    y += 6

    y = heading(y, "COURSES AND MANDATORY TRAINING")
    courses = [
        "ILS (Immediate Life Support) - renewed 02/2026",
        "Perioperative Care Skills, Level 6 module - 2019",
        "Practice Assessor / Practice Supervisor preparation - 2021",
        "Human Factors in the Operating Theatre - 2023",
        "Safeguarding Adults Level 3 and Children Level 2 - current",
        "Manual handling, IPC, fire, information governance - all in date",
    ]
    for c in courses:
        y = text(ML + 10, y, "- " + c, 8.5, "helv", INK)
        y += 1
    y += 10

    y = heading(y, "REFERENCES")
    y = text(ML, y,
             "Ms Helen Trask, Theatre Manager, Kingsmere Private Hospital - "
             "h.trask@example.com. Second clinical reference available from "
             "St Aldwyn's on request. Please do not contact my current employer "
             "before offer.",
             8.5, "helv", INK, width=colw)

    doc.save(path)
    doc.close()
    return path


if __name__ == "__main__":
    print(f"wrote {build()}")
