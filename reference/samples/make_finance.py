"""
Sample CV 2 of 6 - Finance and accounting (financial controller).

FICTIONAL. Invented person, invented employers, example.com email, Ofcom drama
range phone number (07700 900xxx).

Formatting hazard: TABLE-BASED WORD LAYOUT.

This is the single most common way a UK accountant's CV is built: the whole
document is one Word table, dates in a narrow left column, everything else in
the right column, plus a three-across grid for skills. Extraction sees cells,
not paragraphs, so the date and the job it belongs to arrive as two unrelated
runs of text and the skills grid arrives column-major - "Month-end close /
IFRS 16 / Sage Intacct" read downwards instead of across. Borders are drawn to
make the structure visible to a human reader and invisible to a text layer.
"""

import os

import pymupdf

W, H = 595, 842
INK = (0.08, 0.09, 0.11)
MUTED = (0.40, 0.43, 0.48)
RULE = (0.72, 0.75, 0.79)
HEAD_BG = (0.90, 0.92, 0.94)
ACCENT = (0.16, 0.28, 0.44)

L, R = 50, W - 50          # table outer edges
DATE_W = 118               # left column width

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "finance-financial-controller.pdf")


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

    def hline(y):
        page.draw_line(pymupdf.Point(L, y), pymupdf.Point(R, y),
                       color=RULE, width=0.6)

    def vline(y0, y1, x=L + DATE_W):
        page.draw_line(pymupdf.Point(x, y0), pymupdf.Point(x, y1),
                       color=RULE, width=0.6)

    def band(y, label):
        """A shaded full-width table row acting as a section heading."""
        page.draw_rect(pymupdf.Rect(L, y, R, y + 15), color=RULE,
                       fill=HEAD_BG, width=0.6)
        text(L + 6, y + 11, label, 8.5, "hebo", ACCENT)
        return y + 15

    def row(y, dates, body_lines, pad=5):
        """Two-cell table row: dates left, content right."""
        cx = L + DATE_W + 7
        cw = R - cx - 7
        yy = y + pad + 8
        for i, (s, size, font, col) in enumerate(body_lines):
            if len(s) > 78:
                yy = text(cx, yy, s, size, font, col, width=cw)
                yy += 1
            else:
                yy = text(cx, yy, s, size, font, col)
        dy = y + pad + 8
        for d in dates:
            dy = text(L + 6, dy, d, 8, "helv", MUTED)
        bottom = max(yy, dy) + pad - 2
        hline(bottom)
        vline(y, bottom)
        return bottom

    # ---- title block (itself a table row) ----------------------------------
    top = 52
    hline(top)
    y = top + 22
    text(L + 6, y, "FIONA MARCHETTI-DOYLE  ACMA CGMA", 15, "hebo", INK)
    y += 14
    text(L + 6, y, "Financial Controller", 10, "helv", ACCENT)
    text(L + DATE_W + 7, top + 20, "fiona.marchetti-doyle@example.com", 8.5,
         "helv", MUTED)
    text(L + DATE_W + 7, top + 32, "07700 900247", 8.5, "helv", MUTED)
    text(L + DATE_W + 7, top + 44, "Leeds LS8  |  full UK driving licence", 8.5,
         "helv", MUTED)
    y = top + 56
    hline(y)
    vline(top, y)

    # ---- profile -----------------------------------------------------------
    y = band(y, "PROFILE")
    y = row(y, [""], [
        ("Qualified management accountant (CIMA, 2016) running a 9-person finance "
         "function for a 78m turnover food manufacturing group. Took the group "
         "audit from 14 prior-year adjustments to nil in two cycles and pulled the "
         "month-end close from working day 12 to working day 4.", 9, "helv", INK),
    ])

    # ---- experience --------------------------------------------------------
    y = band(y, "CAREER HISTORY")

    y = row(y, ["Feb 2021 -", "present"], [
        ("Harrowgate Foods Group Ltd", 10, "hebo", INK),
        ("Financial Controller", 9, "heit", MUTED),
        ("Group turnover 78m, three manufacturing sites, 620 headcount. "
         "Reporting to the CFO with a team of nine (2 qualified, 3 part-qualified, "
         "4 transactional).", 8.5, "helv", INK),
        ("- Reduced month-end close from WD12 to WD4 by rebuilding the accruals "
         "and cut-off process and killing 40+ spreadsheet handoffs.", 8.5, "helv", INK),
        ("- Led the Sage 200 to Sage Intacct migration, on time and 18k under "
         "budget; ran parallel close for two periods.", 8.5, "helv", INK),
        ("- Implemented IFRS 16 across 41 leases and a standard-costing model that "
         "exposed 1.1m of previously hidden production variance.", 8.5, "helv", INK),
        ("- Refinanced the invoice discounting facility, saving 96k a year in "
         "interest and covenant fees.", 8.5, "helv", INK),
    ])

    y = row(y, ["09/2018 -", "01/2021"], [
        ("Penvale Logistics plc", 10, "hebo", INK),
        ("Finance Manager (Group Reporting)", 9, "heit", MUTED),
        ("- Owned consolidation of 11 entities including two euro-functional "
         "subsidiaries; delivered the group pack to board deadline every period.", 8.5, "helv", INK),
        ("- Rewrote the capex approval process after an internal audit finding.", 8.5, "helv", INK),
    ])

    y = row(y, ["Jul 2014 to", "Aug 2018"], [
        ("Tarrowfield & Co, Chartered Accountants", 10, "hebo", INK),
        ("Audit Senior, then Assistant Manager", 9, "heit", MUTED),
        ("- Ran audit fieldwork on owner-managed businesses from 2m to 40m "
         "turnover, typically four to six live files.", 8.5, "helv", INK),
    ])

    # ---- skills grid: three columns, read column-major by extractors -------
    y = band(y, "SYSTEMS AND TECHNICAL")
    colw = (R - L) / 3.0
    gy = y + 6
    grid = [
        ["Sage Intacct", "Sage 200", "NetSuite (basic)"],
        ["Excel - Power Query", "Power BI", "SQL (SELECT level)"],
        ["IFRS 16 / IFRS 15", "UK GAAP FRS 102", "Consolidations"],
        ["Month-end close", "Statutory accounts", "Cashflow forecasting"],
        ["Budgeting / reforecast", "Standard costing", "Covenant reporting"],
    ]
    for r_i, cells in enumerate(grid):
        for c_i, cell in enumerate(cells):
            text(L + 6 + c_i * colw, gy + 8, cell, 8.5, "helv", INK)
        gy += 13
    gy += 3
    for c_i in (1, 2):
        page.draw_line(pymupdf.Point(L + c_i * colw, y), pymupdf.Point(L + c_i * colw, gy),
                       color=RULE, width=0.6)
    hline(gy)
    page.draw_line(pymupdf.Point(L, y), pymupdf.Point(L, gy), color=RULE, width=0.6)
    page.draw_line(pymupdf.Point(R, y), pymupdf.Point(R, gy), color=RULE, width=0.6)
    y = gy

    # ---- education ---------------------------------------------------------
    y = band(y, "QUALIFICATIONS")
    y = row(y, ["2016"], [("CIMA - ACMA CGMA (first-time passes, final level)", 9, "helv", INK)])
    y = row(y, ["2010 - 2013"], [
        ("BA (Hons) Accounting and Finance, Brandthorpe University - 2:1", 9, "helv", INK)])
    y = row(y, ["2008 - 2010"], [
        ("Ashmore Vale Sixth Form College - A-levels: Maths A, Economics B, "
         "History B", 9, "helv", INK)])

    # outer left/right borders for the whole table
    page.draw_line(pymupdf.Point(L, top), pymupdf.Point(L, y), color=RULE, width=0.6)
    page.draw_line(pymupdf.Point(R, top), pymupdf.Point(R, y), color=RULE, width=0.6)

    doc.save(path)
    doc.close()
    return path


if __name__ == "__main__":
    print(f"wrote {build()}")
