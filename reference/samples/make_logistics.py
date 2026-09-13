"""
Sample CV 7 - Logistics and transport (international CE truck driver).

FICTIONAL. Invented person, invented employers and college, example.com email,
Ofcom drama range phone number (07700 900xxx).

Formatting hazard: THE EUROPASS FORM.

Most CVs from EU drivers, mechanics and warehouse staff arrive as Europass: a
two-column form where every value sits beside a right-aligned label in a narrow
left column. Read in order, the labels interleave with the values ("Dates",
"Occupation or position held", "Name and address of employer" repeated for
every job), and the employer comes *after* the duties rather than beside the
title. It adds a language self-assessment grid, a licence-category table, day-
first dates (15.06.2018), and "Page 1 / 2 - Curriculum vitae of ..." footer
furniture on each page, which carries the candidate's name a second time.

Things to check in the output: employer attached to the right role, the licence
categories and Code 95 kept as certifications, and the name in the footer
redacted along with the one at the top.
"""

import os

import pymupdf

W, H = 595, 842
INK = (0.10, 0.10, 0.12)
LABEL = (0.25, 0.33, 0.45)
MUTED = (0.45, 0.47, 0.52)
RULE = (0.70, 0.74, 0.80)

LABEL_R = 188          # right edge of the label column
VAL_L = 204            # left edge of the value column
VAL_R = W - 48
TOP, BOTTOM = 60, H - 58

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "logistics-ce-driver.pdf")

NAME = "Krawiec, Mateusz"

SECTIONS = [
    ("PERSONAL INFORMATION", [
        ("Surname / First name", NAME),
        ("Address", "ul. Jaworowa 9/4, 62-800 Kalisz, Poland"),
        ("Mobile", "+44 7700 900618 (UK number while on assignment)"),
        ("E-mail", "mateusz.krawiec.transport@example.com"),
        ("Nationality", "Polish"),
    ]),
    ("DESIRED EMPLOYMENT", [
        ("Occupational field", "International CE driver - Benelux and Germany distribution. "
                               "Open to relocating to the Venlo or Tilburg area."),
    ]),
    ("WORK EXPERIENCE", [
        ("Dates", "03.2022 - present"),
        ("Occupation or position held", "CE driver, international (curtainsider and reefer)"),
        ("Main activities and responsibilities",
         "Groupage and full loads Poland - Germany - Netherlands, around 11,000 km a month. "
         "Reefer temperature logs for pharmaceutical loads, CMR and customs paperwork, "
         "load securing to EN 12195-1. Tachograph compliant for four years with no "
         "infringements at roadside checks. No at-fault incidents."),
        ("Name and address of employer", "Wolnica Freight Sp. z o.o., Poznan, Poland"),
        ("Type of business or sector", "International road haulage"),
        ("", ""),
        ("Dates", "15.06.2018 - 28.02.2022"),
        ("Occupation or position held", "C+E driver, domestic night trunking"),
        ("Main activities and responsibilities",
         "Night trunk Kalisz - Wroclaw hub, five nights a week, double-deck trailers. "
         "Daily walkaround checks, defect reporting, trained three new drivers on the route."),
        ("Name and address of employer", "Brzostek Logistyka s.c., Kalisz, Poland"),
        ("Type of business or sector", "Parcel and pallet distribution"),
        ("", ""),
        ("Dates", "2014 - 2018"),
        ("Occupation or position held", "HGV mechanic"),
        ("Main activities and responsibilities",
         "Brakes and air systems, PMI inspections on MAN, DAF and Scania tractor units, "
         "assisting with tachograph calibration."),
        ("Name and address of employer", "Warsztat Ciezarowy Lemanski, Ostrow Wielkopolski, Poland"),
        ("Type of business or sector", "Commercial vehicle servicing"),
    ]),
    ("EDUCATION AND TRAINING", [
        ("Dates", "09.2004 - 06.2008"),
        ("Title of qualification awarded", "Vocational certificate, motor vehicle mechanic"),
        ("Organisation providing education", "Kalisz Vocational College of Transport"),
    ]),
    ("PERSONAL SKILLS", [
        ("Mother tongue", "Polish"),
        ("Other languages", "GRID"),
        ("Driving licence", "B, C, C+E (C+E since 11.2012)"),
        ("Certificates", "Code 95 driver CPC, valid to 11.2027; ADR basic and tanks; "
                         "digital tachograph card; UDT forklift licence"),
    ]),
    ("ADDITIONAL INFORMATION", [
        ("Availability", "From 1 October 2026. Two weeks on, one week off preferred."),
    ]),
]

GRID = [
    ("", "Listening", "Reading", "Speaking", "Writing"),
    ("English", "B1", "B1", "B1", "A2"),
    ("German", "A2", "A2", "A2", "A1"),
]


def build(path=OUT):
    doc = pymupdf.open()
    state = {"page": None, "y": TOP, "n": 0}

    def new_page():
        page = doc.new_page(width=W, height=H)
        state["n"] += 1
        state["page"], state["y"] = page, TOP
        page.insert_text((48, 34), "europass", fontsize=13, fontname="hebo", color=LABEL)
        page.insert_text((118, 34), "Curriculum Vitae", fontsize=9, fontname="helv", color=MUTED)
        page.draw_line(pymupdf.Point(LABEL_R + 8, 44), pymupdf.Point(LABEL_R + 8, H - 44),
                       color=RULE, width=0.5)

    def box(x0, x1, s, size, font, color, align):
        rect = pymupdf.Rect(x0, state["y"], x1, state["y"] + 200)
        rc = state["page"].insert_textbox(rect, s, fontsize=size, fontname=font,
                                          color=color, align=align)
        return 200 - rc if rc >= 0 else size + 4

    def ensure(space):
        if state["page"] is None or state["y"] + space > BOTTOM:
            new_page()

    def row(label, value):
        if not label and not value:
            state["y"] += 6
            return
        ensure(40)
        if value == "GRID":
            box(48, LABEL_R, label, 8, "helv", LABEL, 2)
            for i, cells in enumerate(GRID):
                x = VAL_L
                for j, c in enumerate(cells):
                    w = 70 if j == 0 else 62
                    state["page"].insert_text((x, state["y"] + 9), c, fontsize=8,
                                              fontname="hebo" if i == 0 or j == 0 else "helv",
                                              color=INK)
                    x += w
                state["y"] += 13
            state["y"] += 4
            return
        h_label = box(48, LABEL_R, label, 8, "helv", LABEL, 2)
        h_value = box(VAL_L, VAL_R, value, 9, "helv", INK, 0)
        state["y"] += max(h_label, h_value) + 3

    for title, rows in SECTIONS:
        ensure(60)
        state["y"] += 8
        box(48, LABEL_R, title, 8.5, "hebo", LABEL, 2)
        state["y"] += 16
        for label, value in rows:
            row(label, value)

    total = state["n"]
    for i, page in enumerate(doc, start=1):
        page.insert_text((VAL_L, H - 26), f"Page {i} / {total} - Curriculum vitae of {NAME}",
                         fontsize=7, fontname="helv", color=MUTED)

    doc.save(path)
    doc.close()
    return path


if __name__ == "__main__":
    print(f"wrote {build()}")
