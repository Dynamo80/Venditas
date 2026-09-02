"""
Sample CV 5 of 6 - Legal (commercial solicitor, 5 years PQE).

FICTIONAL. Invented person, invented firms, invented clients, example.com
email, Ofcom drama range phone number (07700 900xxx). The SRA number is not a
real SRA number.

Formatting hazard: LENGTH - three full pages.

Legal CVs are long by convention: a matters list is the CV. Three pages is a
different class of problem from three columns. It pushes the extracted text
past the point where a model will happily summarise instead of transcribing,
and the tell is specific and easy to check: the ten-item schedule of matters on
page two is the part most likely to come back truncated, merged or quietly
paraphrased into "various corporate transactions". Page three carries the
training contract seat rotation, which is the other thing that tends to
collapse into a single line. The document flows continuously across the page
breaks, so one job's bullet list is split by a page boundary as well.
"""

import os

import pymupdf

W, H = 595, 842
INK = (0.08, 0.09, 0.11)
MUTED = (0.42, 0.45, 0.50)
ACCENT = (0.22, 0.16, 0.36)
RULE = (0.75, 0.75, 0.79)

ML, MR = 62, W - 62
TOP, BOTTOM = 66, H - 62

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "legal-commercial-solicitor.pdf")


class Flow:
    """Continuous text flow that breaks across pages mid-section."""

    def __init__(self, doc):
        self.doc = doc
        self.page = None
        self.n = 0
        self.y = 0
        self._new_page()

    def _new_page(self):
        self.page = self.doc.new_page(width=W, height=H)
        self.n += 1
        self.y = TOP
        if self.n > 1:
            self.page.insert_text((ML, TOP - 18),
                                  "H. Vandeleur - curriculum vitae (continued)",
                                  fontsize=7, fontname="heit", color=MUTED)
        self.page.insert_text((MR - 34, H - 40), f"{self.n} / 3",
                              fontsize=7, fontname="helv", color=MUTED)

    def need(self, h):
        if self.y + h > BOTTOM:
            self._new_page()

    def text(self, s, size=9, font="helv", color=INK, indent=0, width=None, gap=0):
        x = ML + indent
        w = width if width is not None else (MR - x)
        self.need(size + 6)
        rc = self.page.insert_textbox(
            pymupdf.Rect(x, self.y, x + w, BOTTOM), s,
            fontsize=size, fontname=font, color=color, align=0,
        )
        if rc < 0:
            # Did not fit on this page: start a fresh page and re-lay it.
            self._new_page()
            rc = self.page.insert_textbox(
                pymupdf.Rect(x, self.y, x + w, BOTTOM), s,
                fontsize=size, fontname=font, color=color, align=0,
            )
        used = (BOTTOM - self.y) - rc
        self.y += used + gap
        return self.y

    def heading(self, label):
        self.need(34)
        self.y += 6
        self.text(label, 9, "hebo", ACCENT)
        self.page.draw_line(pymupdf.Point(ML, self.y - 1),
                            pymupdf.Point(MR, self.y - 1), color=ACCENT, width=0.4)
        self.y += 6

    def bullet(self, s, size=8.6):
        self.text("- " + s, size, "helv", INK, indent=12, width=MR - ML - 12, gap=1)


def build(path=OUT):
    doc = pymupdf.open()
    f = Flow(doc)

    # ======================= page 1 =========================================
    f.text("HARRIET VANDELEUR", 17, "hebo", INK)
    f.text("Solicitor of England and Wales - Corporate and Commercial - "
           "5 years PQE", 10, "helv", ACCENT, gap=3)
    f.text("harriet.vandeleur@example.com  |  07700 900176  |  Birmingham B15  |  "
           "SRA ID 900412 (fictional)", 8.5, "helv", MUTED, gap=8)

    f.heading("PROFILE")
    f.text("Commercial solicitor admitted in September 2021, five years' "
           "post-qualification experience gained in the corporate and commercial "
           "teams of two national firms. Practice split roughly 60/40 between "
           "private M&A on deals of 3m to 45m enterprise value and standalone "
           "commercial contracting, with a growing data protection advisory "
           "practice. Regularly run mid-market transactions with limited "
           "supervision, including two disclosure exercises taken from first "
           "draft to signing without a partner amendment. Looking for a move into "
           "a team where the corporate work is the main event rather than an "
           "adjunct to real estate.", 9, "helv", INK, gap=8)

    f.heading("QUALIFICATIONS AND ADMISSION")
    for line, sub in [
        ("Admitted as a solicitor, England and Wales", "September 2021"),
        ("Legal Practice Course with MSc in Law, Business and Management, "
         "Ravensmoor College of Law, Birmingham", "2017 - 2018, Distinction"),
        ("Graduate Diploma in Law, Ravensmoor College of Law",
         "2016 - 2017, Commendation"),
        ("BA (Hons) History, Kesterwick University", "2013 - 2016, 2:1"),
    ]:
        f.text(line, 9, "hebo", INK)
        f.text(sub, 8, "helv", MUTED, gap=4)
    f.y += 4

    f.heading("EXPERIENCE")

    f.text("Wraysbury Hale LLP, Birmingham", 10.5, "hebo", INK)
    f.text("Associate, Corporate and Commercial", 9, "heit", MUTED)
    f.text("Associate (2 PQE on joining) - March 2023 to present", 8, "helv", MUTED, gap=4)
    for b in [
        "Run share and asset purchases in the 3m to 45m EV range, typically four "
        "to six live matters, acting for both buy-side and sell-side. Responsible "
        "for the transaction timetable, the disclosure exercise, ancillary "
        "documents and completion mechanics.",
        "Led the disclosure exercise on the sale of a 38m turnover facilities "
        "management business, including a data room of 2,100 documents and a "
        "disclosure letter settled across nine drafts.",
        "Draft and negotiate commercial agreements: supply and distribution, "
        "master services agreements, SaaS terms, reseller and agency "
        "arrangements, NDAs at volume.",
        "Advise on UK GDPR compliance for a retail client group - controller and "
        "processor mapping, a suite of DPAs and international transfer risk "
        "assessments following the 2021 SCCs.",
        "Supervise two trainees per seat and mark their drafting. Run the team's "
        "monthly know-how session on warranty and indemnity drafting.",
        "Contribute to the firm's corporate precedent bank; rewrote the "
        "management warranty schedule now used as the team standard.",
    ]:
        f.bullet(b)
    f.y += 8

    f.text("Dunmore Kerridge LLP, Nottingham", 10.5, "hebo", INK)
    f.text("Solicitor, Corporate", 9, "heit", MUTED)
    f.text("Sept 2021 - Feb 2023 (NQ to 1.5 PQE)", 8, "helv", MUTED, gap=4)
    for b in [
        "Newly qualified into corporate on a team of eleven. Ran the smaller end "
        "of the deal list independently from about six months in.",
        "Company secretarial and group reorganisation work: share buybacks, "
        "reductions of capital, articles amendments, EMI option scheme "
        "implementation for three technology clients.",
        "Drafted the ancillary suite on eleven completed transactions and "
        "co-ordinated four completions where the client was in a different "
        "time zone.",
        "Seconded for three months to the in-house legal team of a logistics "
        "client, handling day-to-day contracting and one supplier dispute that "
        "settled before proceedings were issued.",
    ]:
        f.bullet(b)
    f.y += 8

    # ======================= schedule of matters (page 2-ish) ===============
    f.heading("SELECTED MATTERS")
    f.text("Client names are anonymised in accordance with professional "
           "obligations. All matters below were led or substantially run by me.",
           8.2, "heit", MUTED, gap=6)

    matters = [
        "Acted for the founders on the 45m sale of a specialist recruitment group "
        "to a listed acquirer. Ran the disclosure exercise, the W&I insurance "
        "process alongside brokers, and the earn-out drafting covering a "
        "three-year period.",
        "Acted for a private equity-backed trade buyer on the 12.5m acquisition "
        "of a competitor out of an accelerated sale process, completed on a "
        "nine-day timetable with locked-box consideration.",
        "Advised a family-owned manufacturer on a 6m minority investment, "
        "including the investment agreement, amended articles and a shareholders' "
        "deadlock mechanism that survived two subsequent disputes.",
        "Ran a group reorganisation for a construction client ahead of a planned "
        "exit: four intra-group transfers, a capital reduction demerger and the "
        "associated HMRC clearances.",
        "Negotiated a five-year master services agreement and eleven statements "
        "of work for a technology client with an annual contract value of 2.8m, "
        "including a liability cap position that became the client's standard.",
        "Advised a retail group on UK GDPR remediation following a supplier "
        "breach affecting approximately 40,000 customer records - containment "
        "advice, ICO notification assessment and the resulting DPA rewrite.",
        "Acted on the 3.2m acquisition of a veterinary practice group, including "
        "the RCVS regulatory consents and TUPE consultation timetable.",
        "Drafted and negotiated a distribution agreement for entry into three EU "
        "markets, co-ordinating local counsel in Germany, Poland and the "
        "Netherlands on competition law compliance.",
        "Defended a warranty claim brought eighteen months after completion; "
        "advised on the notice provisions and secured discontinuance without "
        "payment.",
        "Advised on an EMI option scheme and its accelerated vesting on a "
        "subsequent share sale, including the HMRC valuation agreement.",
    ]
    for i, m in enumerate(matters, 1):
        f.text(f"{i}.  {m}", 8.6, "helv", INK, indent=8, width=MR - ML - 8, gap=3)
    f.y += 6

    # ======================= page 3 content =================================
    f.heading("TRAINING CONTRACT")
    f.text("Dunmore Kerridge LLP - September 2019 to September 2021", 9, "hebo", INK, gap=3)
    for seat, detail in [
        ("Seat 1: Corporate (Sep 2019 - Mar 2020)",
         "Due diligence, ancillary drafting, Companies House filings. Sat through "
         "two completions."),
        ("Seat 2: Commercial Property (Mar 2020 - Sep 2020)",
         "Largely remote. Leases, licences to alter, and a portfolio refinance "
         "requiring 41 certificates of title."),
        ("Seat 3: Employment (Sept 2020 - March 2021)",
         "Settlement agreements at volume during the redundancy wave, two "
         "tribunal bundles, TUPE advice on a services transfer."),
        ("Seat 4: Commercial and IP (03/2021 - 09/2021)",
         "Supply contracts, a trade mark opposition, and the firm's first "
         "standalone AI procurement contract."),
    ]:
        f.text(seat, 8.8, "hebo", INK)
        f.text(detail, 8.5, "helv", INK, indent=10, width=MR - ML - 10, gap=4)
    f.y += 4

    f.heading("EARLIER EXPERIENCE")
    f.text("Fenchurch Mallory Solicitors - Paralegal, Commercial Litigation",
           9, "hebo", INK)
    f.text("July 2018 to August 2019", 8, "helv", MUTED, gap=3)
    f.bullet("Disclosure review on a 14m contractual dispute; managed a review "
             "team of four paralegals and the Relativity workspace.")
    f.bullet("Drafted witness statement first drafts and chronologies.")
    f.y += 6

    f.heading("PROFESSIONAL DEVELOPMENT AND MEMBERSHIPS")
    for line in [
        "Member, Law Society of England and Wales",
        "Member, Birmingham Trainee Solicitors' Society (committee 2020-21)",
        "IAPP CIPP/E - Certified Information Privacy Professional, Europe (2024)",
        "Advanced Negotiation for Corporate Lawyers, two-day course (Nov 2024)",
        "Co-author, 'Warranty limitations after the 2023 cases', firm client "
        "briefing, issued February 2025",
    ]:
        f.bullet(line)
    f.y += 6

    f.heading("SYSTEMS AND DRAFTING")
    f.text("iManage, HighQ and Relativity to a working standard. Practical "
           "Law and Lexis+ for know-how. Built and maintain the corporate team's "
           "Excel-based completion checklist and funds flow template, now used on "
           "every deal in the department. Comfortable running a virtual data room "
           "end to end without paralegal support, which on smaller deals is "
           "usually the difference between a profitable matter and a written-off "
           "one.", 8.6, "helv", INK, gap=8)

    f.heading("ADDITIONAL")
    f.text("Pro bono: fortnightly volunteer adviser at a Birmingham law centre "
           "since 2022, principally consumer and housing enquiries. Trustee of a "
           "small local arts charity (appointed 2024) with responsibility for its "
           "contracts and data protection compliance. Conversational French. "
           "Full clean UK driving licence. Available at one month's notice.",
           8.6, "helv", INK, gap=8)

    f.heading("REFERENCES")
    f.text("Available on request. Please do not approach my current firm without "
           "prior consent.", 8.6, "helv", INK)

    # Guarantee a genuine third page even if the flow lands short.
    while f.n < 3:
        f._new_page()
        f.text("References (continued)", 9, "hebo", ACCENT)
        f.text("Two professional referees can be supplied on request, including "
               "the supervising partner on the matters listed above.",
               8.6, "helv", INK)

    doc.save(path)
    doc.close()
    return path


if __name__ == "__main__":
    p = build()
    d = pymupdf.open(p)
    print(f"wrote {p} ({d.page_count} pages)")
    d.close()
