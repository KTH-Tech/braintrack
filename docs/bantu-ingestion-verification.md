# Bantu Language Ingestion Verification (Task #314)

Generated: 2026-05-04T03:47:02.310Z

Pass criteria (per task #314):
- Every Bantu HL/FAL paper row in the catalog has `verbatim_qcount > 1` (target: dozens).
- Status-agnostic: `failed`, `completed-but-blob`, and `no log row` all fail this check.
- Papers not yet OK need a manual reparse from `admin-dbe-advanced` (URLs listed below).

## Per-subject summary (from catalog)

| Subject | Catalog papers | OK (>1 q) | Stuck-as-blob | Failed | No log row | Avg q/paper | Max q |
|---|---:|---:|---:|---:|---:|---:|---:|
| Sepedi First Additional Language | 30 | 15 | 15 | 0 | 0 | 1.5 | 2 |
| Sepedi Home Language | 33 | 3 | 30 | 0 | 0 | 1.1 | 2 |
| Sepedi Second Additional Language | 11 | 4 | 7 | 0 | 0 | 1.4 | 2 |
| Sesotho First Additional Language | 26 | 8 | 15 | 3 | 0 | 1.2 | 2 |
| Sesotho Home Language | 30 | 2 | 26 | 2 | 0 | 1.0 | 2 |
| Sesotho Second Additional Language | 14 | 3 | 11 | 0 | 0 | 1.2 | 2 |
| Setswana First Additional Language | 27 | 9 | 15 | 3 | 0 | 1.2 | 2 |
| Setswana Home Language | 33 | 15 | 15 | 3 | 0 | 1.4 | 2 |
| Setswana Second Additional Language | 3 | 0 | 3 | 0 | 0 | 1.0 | 1 |
| Tshivenda First Additional Language | 27 | 0 | 0 | 0 | 27 | 0.1 | 1 |
| Tshivenda Home Language | 32 | 0 | 0 | 0 | 32 | 0.1 | 1 |
| Xitsonga First Additional Language | 27 | 0 | 0 | 0 | 27 | 0.4 | 1 |
| Xitsonga Home Language | 33 | 0 | 0 | 0 | 33 | 0.5 | 1 |
| isiNdebele First Additional Language | 24 | 9 | 15 | 0 | 0 | 1.4 | 2 |
| isiNdebele Home Language | 30 | 9 | 21 | 0 | 0 | 1.3 | 2 |
| isiNdebele Second Additional Language | 12 | 3 | 9 | 0 | 0 | 1.3 | 2 |
| isiXhosa First Additional Language | 30 | 3 | 27 | 0 | 0 | 1.1 | 2 |
| isiXhosa Home Language | 29 | 1 | 28 | 0 | 0 | 1.0 | 2 |
| isiXhosa Second Additional Language | 14 | 2 | 12 | 0 | 0 | 1.1 | 2 |
| isiZulu First Additional Language | 30 | 5 | 25 | 0 | 0 | 1.2 | 2 |
| isiZulu Home Language | 30 | 10 | 20 | 0 | 0 | 1.3 | 2 |
| isiZulu Second Additional Language | 6 | 0 | 6 | 0 | 0 | 1.0 | 1 |
| siSwati | 33 | 0 | 30 | 3 | 0 | 0.9 | 1 |

## Overall

- Catalog Bantu papers (HL/FAL/SAL combined): **564**
- HL/FAL catalog papers (the must-pass set): **504**
- Papers OK (>1 q stored): **101**
- Papers stuck as one Q1 blob: **330**
- Papers in failed state (e.g. DBE 403): **14**
- Papers with no ingestion-log row at all: **119**
- HL/FAL papers NOT OK (hard gate): **415**

## Papers still needing manual reparse

| Subject | Year | Paper | State | log.qcount | verbatim qcount | Source URL | Last error |
|---|---:|---:|---|---:|---:|---|---|
| Sepedi First Additional Language | 2025 | P1 | stuck_blob | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=F9gz3PnCpWQ%3d&tabid=5742&portalid=0&mid=14818) |  |
| Sepedi First Additional Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=8hM2oCzIJGc%3d&tabid=5742&portalid=0&mid=14818) |  |
| Sepedi First Additional Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=7YuzE4-drNM%3d&tabid=5742&portalid=0&mid=14818) |  |
| Sepedi First Additional Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=PHhGBXbFsOE%3d&tabid=5193&portalid=0&mid=13696) |  |
| Sepedi First Additional Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=R0EKx37Y1RM%3d&tabid=5193&portalid=0&mid=13696) |  |
| Sepedi First Additional Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=W0ovx2vk8GI%3d&tabid=5193&portalid=0&mid=13696) |  |
| Sepedi First Additional Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=2sS3bPrnbBg%3d&tabid=4682&portalid=0&mid=12653) |  |
| Sepedi First Additional Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ljk9A_iqtls%3d&tabid=4682&portalid=0&mid=12653) |  |
| Sepedi First Additional Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=4USwza7VfuQ%3d&tabid=4682&portalid=0&mid=12653) |  |
| Sepedi First Additional Language | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=hpRAFAD7ros%3d&tabid=1856&portalid=0&mid=8602) |  |
| Sepedi First Additional Language | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=C4fA_FZaJEE%3d&tabid=1856&portalid=0&mid=8602) |  |
| Sepedi First Additional Language | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=9nlKTD7GB2c%3d&tabid=1856&portalid=0&mid=8602) |  |
| Sepedi First Additional Language | 2015 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=lcWWe5oQJVY%3d&tabid=979&portalid=0&mid=4303) |  |
| Sepedi First Additional Language | 2015 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=k22dNBQ4s6k%3d&tabid=979&portalid=0&mid=4303) |  |
| Sepedi First Additional Language | 2015 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=UjXQBpCFjBc%3d&tabid=979&portalid=0&mid=4303) |  |
| Sepedi Home Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Exppv69deqU%3d&tabid=5742&portalid=0&mid=14818) |  |
| Sepedi Home Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=hoi394TsdS4%3d&tabid=5742&portalid=0&mid=14818) |  |
| Sepedi Home Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=9w2d-oJ5_lo%3d&tabid=5742&portalid=0&mid=14818) |  |
| Sepedi Home Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=FygSqQ5mAio%3d&tabid=5193&portalid=0&mid=13696) |  |
| Sepedi Home Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=IZFb_GDHOpg%3d&tabid=5193&portalid=0&mid=13696) |  |
| Sepedi Home Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=AtCxQnSvia4%3d&tabid=5193&portalid=0&mid=13696) |  |
| Sepedi Home Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=EGVL2l-V7rM%3d&tabid=4682&portalid=0&mid=12653) |  |
| Sepedi Home Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=_vc8WY_6Z-Y%3d&tabid=4682&portalid=0&mid=12653) |  |
| Sepedi Home Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=MDscXskbPsY%3d&tabid=4682&portalid=0&mid=12653) |  |
| Sepedi Home Language | 2021 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=VyeJOL9MwHY%3d&tabid=2922&portalid=0&mid=10171) |  |
| Sepedi Home Language | 2021 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=hgFN5chfm2I%3d&tabid=2922&portalid=0&mid=10171) |  |
| Sepedi Home Language | 2021 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=wrxRrYSJxWg%3d&tabid=2922&portalid=0&mid=10171) |  |
| Sepedi Home Language | 2020 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=TW0hVCaR9iM%3d&tabid=2702&portalid=0&mid=10164) |  |
| Sepedi Home Language | 2020 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=1IF5z9pQ95U%3d&tabid=2702&portalid=0&mid=10164) |  |
| Sepedi Home Language | 2020 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ijJllpq_YWM%3d&tabid=2702&portalid=0&mid=10164) |  |
| Sepedi Home Language | 2019 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=plufEQHlC-s%3d&tabid=2468&portalid=0&mid=8914) |  |
| Sepedi Home Language | 2019 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=SaKhsJggO8Q%3d&tabid=2468&portalid=0&mid=8914) |  |
| Sepedi Home Language | 2019 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=USi92ZerWss%3d&tabid=2468&portalid=0&mid=8914) |  |
| Sepedi Home Language | 2018 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=KmYtRJEFwwc%3d&tabid=1920&portalid=0&mid=7569) |  |
| Sepedi Home Language | 2018 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=9K0C8nAlkj0%3d&tabid=1920&portalid=0&mid=7569) |  |
| Sepedi Home Language | 2018 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=lovZ_JutMgI%3d&tabid=1920&portalid=0&mid=7569) |  |
| Sepedi Home Language | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=FfO2F4_xOl8%3d&tabid=1856&portalid=0&mid=8602) |  |
| Sepedi Home Language | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=nsEBrET-K34%3d&tabid=1856&portalid=0&mid=8602) |  |
| Sepedi Home Language | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=If_T2CF_BUE%3d&tabid=1856&portalid=0&mid=8602) |  |
| Sepedi Home Language | 2016 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=QzFzwrUKRC8%3d&tabid=1000&portalid=0&mid=4418) |  |
| Sepedi Home Language | 2016 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=k-eJLuWPV68%3d&tabid=1000&portalid=0&mid=4418) |  |
| Sepedi Home Language | 2016 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=3lpt_BpuzGQ%3d&tabid=1000&portalid=0&mid=4418) |  |
| Sepedi Home Language | 2015 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=RwsNoEFNwp8%3d&tabid=979&portalid=0&mid=4303) |  |
| Sepedi Home Language | 2015 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=gidWmKZSMtE%3d&tabid=979&portalid=0&mid=4303) |  |
| Sepedi Home Language | 2015 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=owDwX0rB7TE%3d&tabid=979&portalid=0&mid=4303) |  |
| Sepedi Second Additional Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=JeAhoiUKLnE%3d&tabid=5742&portalid=0&mid=14818) |  |
| Sepedi Second Additional Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=qVpIilZ2y1U%3d&tabid=5742&portalid=0&mid=14818) |  |
| Sepedi Second Additional Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=376SCrCmbU0%3d&tabid=5742&portalid=0&mid=14818) |  |
| Sepedi Second Additional Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ICOZ_3NglhA%3d&tabid=5193&portalid=0&mid=13696) |  |
| Sepedi Second Additional Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=JEvbywDU7-Q%3d&tabid=5193&portalid=0&mid=13696) |  |
| Sepedi Second Additional Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=EAv5wgfLzY8%3d&tabid=4682&portalid=0&mid=12653) |  |
| Sepedi Second Additional Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=LuDv6lVJrvU%3d&tabid=4682&portalid=0&mid=12653) |  |
| Sesotho First Additional Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=t2wSke7TBCo%3d&tabid=5742&portalid=0&mid=14820) |  |
| Sesotho First Additional Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=KBFeqQyq1ds%3d&tabid=5742&portalid=0&mid=14820) |  |
| Sesotho First Additional Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=LIhqNMloPQQ%3d&tabid=5742&portalid=0&mid=14820) |  |
| Sesotho First Additional Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=8TFn2C2q1Fo%3d&tabid=5193&portalid=0&mid=13698) |  |
| Sesotho First Additional Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=epXPHklmbmg%3d&tabid=5193&portalid=0&mid=13698) |  |
| Sesotho First Additional Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ohobulO10kY%3d&tabid=5193&portalid=0&mid=13698) |  |
| Sesotho First Additional Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=QZlPMyp6VE0%3d&tabid=4682&portalid=0&mid=12655) |  |
| Sesotho First Additional Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=wtJ6qjAOx2g%3d&tabid=4682&portalid=0&mid=12655) |  |
| Sesotho First Additional Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=g9nMVfCQlv0%3d&tabid=4682&portalid=0&mid=12655) |  |
| Sesotho First Additional Language | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=5zktPMUj-tM%3d&tabid=1856&portalid=0&mid=7325) |  |
| Sesotho First Additional Language | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=qvcIISeUGII%3d&tabid=1856&portalid=0&mid=7325) |  |
| Sesotho First Additional Language | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=tsmZECfo73c%3d&tabid=1856&portalid=0&mid=7325) |  |
| Sesotho First Additional Language | 2016 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=y-ExHjDdoJg%3d&tabid=1000&portalid=0&mid=4419) |  |
| Sesotho First Additional Language | 2016 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=IxQ3vMXexAs%3d&tabid=1000&portalid=0&mid=4419) |  |
| Sesotho First Additional Language | 2016 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=yQ2Z_kcRlek%3d&tabid=1000&portalid=0&mid=4419) |  |
| Sesotho First Additional Language | 2015 | P1 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=yup3KQwvBmc%3d&tabid=979&portalid=0&mid=4304) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| Sesotho First Additional Language | 2015 | P2 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=j9DXqXr6fuE%3d&tabid=979&portalid=0&mid=4304) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| Sesotho First Additional Language | 2015 | P3 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=V5KweTV31J4%3d&tabid=979&portalid=0&mid=4304) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| Sesotho Home Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=QShb5Kegq-I%3d&tabid=5742&portalid=0&mid=14820) |  |
| Sesotho Home Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=XRe0lljoIXA%3d&tabid=5742&portalid=0&mid=14820) |  |
| Sesotho Home Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=golJllMyOlg%3d&tabid=5742&portalid=0&mid=14820) |  |
| Sesotho Home Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=RMg3wsIIaqg%3d&tabid=5193&portalid=0&mid=13698) |  |
| Sesotho Home Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ZFSAsINhWAY%3d&tabid=5193&portalid=0&mid=13698) |  |
| Sesotho Home Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=5NWk1HQK3As%3d&tabid=5193&portalid=0&mid=13698) |  |
| Sesotho Home Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=6J75h6m8Ars%3d&tabid=4682&portalid=0&mid=12655) |  |
| Sesotho Home Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=aLwe2KTfa6U%3d&tabid=4682&portalid=0&mid=12655) |  |
| Sesotho Home Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=wkwM7uKUXzo%3d&tabid=4682&portalid=0&mid=12655) |  |
| Sesotho Home Language | 2022 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Li8sMpWcJkM%3d&tabid=3138&portalid=0&mid=10548) |  |
| Sesotho Home Language | 2021 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=0UP_9ujAGsg%3d&tabid=2922&portalid=0&mid=10180) |  |
| Sesotho Home Language | 2021 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=tKzaSD9TobA%3d&tabid=2922&portalid=0&mid=10180) |  |
| Sesotho Home Language | 2021 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=V303yvUxnRc%3d&tabid=2922&portalid=0&mid=10180) |  |
| Sesotho Home Language | 2019 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Aov-S7i2cDw%3d&tabid=2468&portalid=0&mid=8915) |  |
| Sesotho Home Language | 2019 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=gqn6H68X_Es%3d&tabid=2468&portalid=0&mid=8915) |  |
| Sesotho Home Language | 2019 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=VPPsVJlJAZ4%3d&tabid=2468&portalid=0&mid=8915) |  |
| Sesotho Home Language | 2018 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=yXoCpwCbHfM%3d&tabid=1920&portalid=0&mid=7570) |  |
| Sesotho Home Language | 2018 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Ll7gI0R1MYQ%3d&tabid=1920&portalid=0&mid=7570) |  |
| Sesotho Home Language | 2018 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=XTAxc3N0-yc%3d&tabid=1920&portalid=0&mid=7570) |  |
| Sesotho Home Language | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=t6xCAltPqsk%3d&tabid=1856&portalid=0&mid=7325) |  |
| Sesotho Home Language | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=J0PzTrU9-3k%3d&tabid=1856&portalid=0&mid=7325) |  |
| Sesotho Home Language | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=BXT_AD0VlBQ%3d&tabid=1856&portalid=0&mid=7325) |  |
| Sesotho Home Language | 2016 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=A0nEs-_HLts%3d&tabid=1000&portalid=0&mid=4419) |  |
| Sesotho Home Language | 2016 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=0BV1CTiZm_E%3d&tabid=1000&portalid=0&mid=4419) |  |
| Sesotho Home Language | 2016 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ujELpPq-JFY%3d&tabid=1000&portalid=0&mid=4419) |  |
| Sesotho Home Language | 2015 | P1 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=mp2xLwy_CuQ%3d&tabid=979&portalid=0&mid=4304) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| Sesotho Home Language | 2015 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=RMlSZzbQzOY%3d&tabid=979&portalid=0&mid=4304) |  |
| Sesotho Home Language | 2015 | P3 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=aOQvz_BWNNI%3d&tabid=979&portalid=0&mid=4304) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| Sesotho Second Additional Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=xUpkBety61U%3d&tabid=5742&portalid=0&mid=14820) |  |
| Sesotho Second Additional Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=WHIqM29733o%3d&tabid=5742&portalid=0&mid=14820) |  |
| Sesotho Second Additional Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=jPFub3f28EQ%3d&tabid=5742&portalid=0&mid=14820) |  |
| Sesotho Second Additional Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=UnFz7qyezjw%3d&tabid=5193&portalid=0&mid=13698) |  |
| Sesotho Second Additional Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=H0S4nO8csQ4%3d&tabid=5193&portalid=0&mid=13698) |  |
| Sesotho Second Additional Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=0UnA-m448fA%3d&tabid=5193&portalid=0&mid=13698) |  |
| Sesotho Second Additional Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=jIfi7EO18cY%3d&tabid=4682&portalid=0&mid=12655) |  |
| Sesotho Second Additional Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=TR4vAUVShyg%3d&tabid=4682&portalid=0&mid=12655) |  |
| Sesotho Second Additional Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=3L7zKkknmh8%3d&tabid=4682&portalid=0&mid=12655) |  |
| Sesotho Second Additional Language | 2016 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=klLN8FXcOxA%3d&tabid=1000&portalid=0&mid=4419) |  |
| Sesotho Second Additional Language | 2016 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=hAXDg2AIw6o%3d&tabid=1000&portalid=0&mid=4419) |  |
| Setswana First Additional Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=b06LPX8IK4s%3d&tabid=5742&portalid=0&mid=14819) |  |
| Setswana First Additional Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=EqjBbaol1-o%3d&tabid=5742&portalid=0&mid=14819) |  |
| Setswana First Additional Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=GVxIGf0qoAo%3d&tabid=5742&portalid=0&mid=14819) |  |
| Setswana First Additional Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=65ihDLOboLw%3d&tabid=5193&portalid=0&mid=13697) |  |
| Setswana First Additional Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=O9kRtHeWJho%3d&tabid=5193&portalid=0&mid=13697) |  |
| Setswana First Additional Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=dxjO0OjIx0Q%3d&tabid=5193&portalid=0&mid=13697) |  |
| Setswana First Additional Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=vDaicMPL3sc%3d&tabid=4682&portalid=0&mid=12654) |  |
| Setswana First Additional Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=l2vkzOa1EdQ%3d&tabid=4682&portalid=0&mid=12654) |  |
| Setswana First Additional Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=GDwPkbdCaMg%3d&tabid=4682&portalid=0&mid=12654) |  |
| Setswana First Additional Language | 2019 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=RyvbvPQdwuI%3d&tabid=2468&portalid=0&mid=8919) |  |
| Setswana First Additional Language | 2019 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=V6vMWk8Pcok%3d&tabid=2468&portalid=0&mid=8919) |  |
| Setswana First Additional Language | 2019 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=vy4xS4950So%3d&tabid=2468&portalid=0&mid=8919) |  |
| Setswana First Additional Language | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=kcZ9FrW6P_k%3d&tabid=1856&portalid=0&mid=8613) |  |
| Setswana First Additional Language | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=7PDmLLlUuNk%3d&tabid=1856&portalid=0&mid=8613) |  |
| Setswana First Additional Language | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=1ESjCo3eIoM%3d&tabid=1856&portalid=0&mid=8613) |  |
| Setswana First Additional Language | 2015 | P1 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=NqH7Z62ZpG0%3d&tabid=979&portalid=0&mid=4305) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| Setswana First Additional Language | 2015 | P2 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=NNIyYkTYniU%3d&tabid=979&portalid=0&mid=4305) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| Setswana First Additional Language | 2015 | P3 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=P4-Hck7BWFQ%3d&tabid=979&portalid=0&mid=4305) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| Setswana Home Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=cFMaUn-5jk0%3d&tabid=5742&portalid=0&mid=14819) |  |
| Setswana Home Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=bHMeQTKb_mc%3d&tabid=5742&portalid=0&mid=14819) |  |
| Setswana Home Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=KT7PyJrs2Xo%3d&tabid=5742&portalid=0&mid=14819) |  |
| Setswana Home Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=esERwrQCY7k%3d&tabid=5193&portalid=0&mid=13697) |  |
| Setswana Home Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=tLulfvZkwa0%3d&tabid=5193&portalid=0&mid=13697) |  |
| Setswana Home Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=yW_-cKg11J8%3d&tabid=5193&portalid=0&mid=13697) |  |
| Setswana Home Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=7TNYpjnAQeU%3d&tabid=4682&portalid=0&mid=12654) |  |
| Setswana Home Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=3mHOXp1Jcg4%3d&tabid=4682&portalid=0&mid=12654) |  |
| Setswana Home Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Bq4gJahK6qM%3d&tabid=4682&portalid=0&mid=12654) |  |
| Setswana Home Language | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=VZDfMHiThtc%3d&tabid=1856&portalid=0&mid=8613) |  |
| Setswana Home Language | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=M0cFhDLeD-A%3d&tabid=1856&portalid=0&mid=8613) |  |
| Setswana Home Language | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=dCszbozEi8U%3d&tabid=1856&portalid=0&mid=8613) |  |
| Setswana Home Language | 2016 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=DXNEHO-EYSA%3d&tabid=1000&portalid=0&mid=4420) |  |
| Setswana Home Language | 2016 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=6X1TIcc4fOI%3d&tabid=1000&portalid=0&mid=4420) |  |
| Setswana Home Language | 2016 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=GCV9o1E-ARE%3d&tabid=1000&portalid=0&mid=4420) |  |
| Setswana Home Language | 2015 | P1 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Rml-EL-3vAQ%3d&tabid=979&portalid=0&mid=4305) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| Setswana Home Language | 2015 | P2 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=70TKwO-SHf4%3d&tabid=979&portalid=0&mid=4305) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| Setswana Home Language | 2015 | P3 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ZqZYyQI85qg%3d&tabid=979&portalid=0&mid=4305) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| Setswana Second Additional Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=vzGkV9CKnkU%3d&tabid=5742&portalid=0&mid=14819) |  |
| Setswana Second Additional Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=9Vx_jk3_MAg%3d&tabid=5742&portalid=0&mid=14819) |  |
| Setswana Second Additional Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Llg6qO6GT6w%3d&tabid=5742&portalid=0&mid=14819) |  |
| Tshivenda First Additional Language | 2025 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=oFM3cjEo_I8%3d&tabid=5742&portalid=0&mid=14822) |  |
| Tshivenda First Additional Language | 2025 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=uRf7fVjSSMQ%3d&tabid=5742&portalid=0&mid=14822) |  |
| Tshivenda First Additional Language | 2025 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=o0CpEt67VNc%3d&tabid=5742&portalid=0&mid=14822) |  |
| Tshivenda First Additional Language | 2024 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=QlDdcXAQdXY%3d&tabid=5193&portalid=0&mid=13700) |  |
| Tshivenda First Additional Language | 2024 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=2Gr8qYMpE9Q%3d&tabid=5193&portalid=0&mid=13700) |  |
| Tshivenda First Additional Language | 2024 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=8LTT4EalIXU%3d&tabid=5193&portalid=0&mid=13700) |  |
| Tshivenda First Additional Language | 2023 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=qppUdW6czV4%3d&tabid=4682&portalid=0&mid=12657) |  |
| Tshivenda First Additional Language | 2023 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=g9KkWWNnFhU%3d&tabid=4682&portalid=0&mid=12657) |  |
| Tshivenda First Additional Language | 2023 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=RCkgmPbPhsk%3d&tabid=4682&portalid=0&mid=12657) |  |
| Tshivenda First Additional Language | 2022 | P1 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=z6lIl-eIuIQ%3d&tabid=3138&portalid=0&mid=10551) |  |
| Tshivenda First Additional Language | 2022 | P2 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=IQiGMmfbJso%3d&tabid=3138&portalid=0&mid=10551) |  |
| Tshivenda First Additional Language | 2022 | P3 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ozYy0Ts55Xg%3d&tabid=3138&portalid=0&mid=10551) |  |
| Tshivenda First Additional Language | 2021 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=1UJfbBn_iG4%3d&tabid=2922&portalid=0&mid=10174) |  |
| Tshivenda First Additional Language | 2021 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=b08j_P8l6nA%3d&tabid=2922&portalid=0&mid=10174) |  |
| Tshivenda First Additional Language | 2021 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=uJRWivWagCk%3d&tabid=2922&portalid=0&mid=10174) |  |
| Tshivenda First Additional Language | 2020 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=3A0tvRkhGo4%3d&tabid=2702&portalid=0&mid=10160) |  |
| Tshivenda First Additional Language | 2020 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=8bO09gsU888%3d&tabid=2702&portalid=0&mid=10160) |  |
| Tshivenda First Additional Language | 2020 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=M-vM9kD8IDQ%3d&tabid=2702&portalid=0&mid=10160) |  |
| Tshivenda First Additional Language | 2019 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ISvbe9DKpb4%3d&tabid=2468&portalid=0&mid=8921) |  |
| Tshivenda First Additional Language | 2019 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=_HI4EZbctGc%3d&tabid=2468&portalid=0&mid=8921) |  |
| Tshivenda First Additional Language | 2019 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=bvsTAWL4vic%3d&tabid=2468&portalid=0&mid=8921) |  |
| Tshivenda First Additional Language | 2017 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=xkWraw7cg_Q%3d&tabid=1856&portalid=0&mid=8635) |  |
| Tshivenda First Additional Language | 2017 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=UK-G42X8i9g%3d&tabid=1856&portalid=0&mid=8635) |  |
| Tshivenda First Additional Language | 2017 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=U3KmNpA8QGY%3d&tabid=1856&portalid=0&mid=8635) |  |
| Tshivenda First Additional Language | 2015 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=mNEf82BN3ho%3d&tabid=979&portalid=0&mid=4307) |  |
| Tshivenda First Additional Language | 2015 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=O7l7vgdZQns%3d&tabid=979&portalid=0&mid=4307) |  |
| Tshivenda First Additional Language | 2015 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=OsWjWwcbXF0%3d&tabid=979&portalid=0&mid=4307) |  |
| Tshivenda Home Language | 2025 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=UpnC0aL7f5o%3d&tabid=5742&portalid=0&mid=14822) |  |
| Tshivenda Home Language | 2025 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=NtgKKnFUsuY%3d&tabid=5742&portalid=0&mid=14822) |  |
| Tshivenda Home Language | 2025 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=lzq3SJ38vEs%3d&tabid=5742&portalid=0&mid=14822) |  |
| Tshivenda Home Language | 2024 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=yp3-TswAHs4%3d&tabid=5193&portalid=0&mid=13700) |  |
| Tshivenda Home Language | 2024 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=MrsVx1enfVk%3d&tabid=5193&portalid=0&mid=13700) |  |
| Tshivenda Home Language | 2024 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=hHZzrlM4mU8%3d&tabid=5193&portalid=0&mid=13700) |  |
| Tshivenda Home Language | 2023 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=wCCGQHOQMJw%3d&tabid=4682&portalid=0&mid=12657) |  |
| Tshivenda Home Language | 2023 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=JG3CRnCamJU%3d&tabid=4682&portalid=0&mid=12657) |  |
| Tshivenda Home Language | 2023 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Zc--UDPGU-k%3d&tabid=4682&portalid=0&mid=12657) |  |
| Tshivenda Home Language | 2022 | P1 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=I_gB0XF7LpM%3d&tabid=3138&portalid=0&mid=10551) |  |
| Tshivenda Home Language | 2022 | P2 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=75qDaXTeQog%3d&tabid=3138&portalid=0&mid=10551) |  |
| Tshivenda Home Language | 2022 | P3 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=uuPRNCKPJx8%3d&tabid=3138&portalid=0&mid=10551) |  |
| Tshivenda Home Language | 2021 | P1 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=qCguNrj9Cwg%3d&tabid=2922&portalid=0&mid=10174) |  |
| Tshivenda Home Language | 2021 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=bahR0Dq0DsM%3d&tabid=2922&portalid=0&mid=10174) |  |
| Tshivenda Home Language | 2021 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=mVz8FPZ8Yy8%3d&tabid=2922&portalid=0&mid=10174) |  |
| Tshivenda Home Language | 2020 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=vWBTHJlgY6E%3d&tabid=2702&portalid=0&mid=10160) |  |
| Tshivenda Home Language | 2020 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=mc09bf6H-dA%3d&tabid=2702&portalid=0&mid=10160) |  |
| Tshivenda Home Language | 2019 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=_s8DmVSLM2s%3d&tabid=2468&portalid=0&mid=8921) |  |
| Tshivenda Home Language | 2019 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=fanWmgsb01I%3d&tabid=2468&portalid=0&mid=8921) |  |
| Tshivenda Home Language | 2019 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Rv1Pwb1_wIE%3d&tabid=2468&portalid=0&mid=8921) |  |
| Tshivenda Home Language | 2018 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=RKrTocGsmm8%3d&tabid=1920&portalid=0&mid=7573) |  |
| Tshivenda Home Language | 2018 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=KiChiG0zoKg%3d&tabid=1920&portalid=0&mid=7573) |  |
| Tshivenda Home Language | 2018 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=fu2Cy9jt6pQ%3d&tabid=1920&portalid=0&mid=7573) |  |
| Tshivenda Home Language | 2017 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=zE8P1R5fJN0%3d&tabid=1856&portalid=0&mid=8635) |  |
| Tshivenda Home Language | 2017 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=xQSFPCoZFeA%3d&tabid=1856&portalid=0&mid=8635) |  |
| Tshivenda Home Language | 2017 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=QdgeVMAIcYc%3d&tabid=1856&portalid=0&mid=8635) |  |
| Tshivenda Home Language | 2016 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=FecjsE5hPfc%3d&tabid=1000&portalid=0&mid=4422) |  |
| Tshivenda Home Language | 2016 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=z7LMtqRa_48%3d&tabid=1000&portalid=0&mid=4422) |  |
| Tshivenda Home Language | 2016 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=vHFrQB_SAcs%3d&tabid=1000&portalid=0&mid=4422) |  |
| Tshivenda Home Language | 2015 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=dVE47rw5d4o%3d&tabid=979&portalid=0&mid=4307) |  |
| Tshivenda Home Language | 2015 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=1uX-1lLDilM%3d&tabid=979&portalid=0&mid=4307) |  |
| Tshivenda Home Language | 2015 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=zwA3eepGDuM%3d&tabid=979&portalid=0&mid=4307) |  |
| Xitsonga First Additional Language | 2025 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ZPB4aRkHHKo%3d&tabid=5742&portalid=0&mid=14823) |  |
| Xitsonga First Additional Language | 2025 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=l7eVcO0-I8s%3d&tabid=5742&portalid=0&mid=14823) |  |
| Xitsonga First Additional Language | 2025 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=u4hl5d4gnqA%3d&tabid=5742&portalid=0&mid=14823) |  |
| Xitsonga First Additional Language | 2024 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=T0aNAMsQ6qY%3d&tabid=5193&portalid=0&mid=13701) |  |
| Xitsonga First Additional Language | 2024 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Pe2CGN0dS8A%3d&tabid=5193&portalid=0&mid=13701) |  |
| Xitsonga First Additional Language | 2024 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=vnENYEqd3WI%3d&tabid=5193&portalid=0&mid=13701) |  |
| Xitsonga First Additional Language | 2023 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=938Tc01EWO8%3d&tabid=4682&portalid=0&mid=12658) |  |
| Xitsonga First Additional Language | 2023 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=-5HYSggBt44%3d&tabid=4682&portalid=0&mid=12658) |  |
| Xitsonga First Additional Language | 2023 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=s8dRzb5LG6k%3d&tabid=4682&portalid=0&mid=12658) |  |
| Xitsonga First Additional Language | 2022 | P1 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=gA_OGviK6Ro%3d&tabid=3138&portalid=0&mid=10552) |  |
| Xitsonga First Additional Language | 2022 | P2 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Z67d4HavdYc%3d&tabid=3138&portalid=0&mid=10552) |  |
| Xitsonga First Additional Language | 2022 | P3 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=eMjKlBflUew%3d&tabid=3138&portalid=0&mid=10552) |  |
| Xitsonga First Additional Language | 2021 | P1 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=PYJGVxKQIWw%3d&tabid=2922&portalid=0&mid=10175) |  |
| Xitsonga First Additional Language | 2021 | P2 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=mka3najtjHY%3d&tabid=2922&portalid=0&mid=10175) |  |
| Xitsonga First Additional Language | 2021 | P3 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=-O8L6S8kKlc%3d&tabid=2922&portalid=0&mid=10175) |  |
| Xitsonga First Additional Language | 2020 | P1 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=zM574v5fJAc%3d&tabid=2702&portalid=0&mid=10159) |  |
| Xitsonga First Additional Language | 2020 | P2 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=_wuzu_Vpvas%3d&tabid=2702&portalid=0&mid=10159) |  |
| Xitsonga First Additional Language | 2020 | P3 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=QwUuBYKmeDU%3d&tabid=2702&portalid=0&mid=10159) |  |
| Xitsonga First Additional Language | 2019 | P1 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=6NZqe66c4JY%3d&tabid=2468&portalid=0&mid=8922) |  |
| Xitsonga First Additional Language | 2019 | P2 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=hliT3BNfbXM%3d&tabid=2468&portalid=0&mid=8922) |  |
| Xitsonga First Additional Language | 2019 | P3 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=M3pUhJTVSM4%3d&tabid=2468&portalid=0&mid=8922) |  |
| Xitsonga First Additional Language | 2017 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=osvBqZHwrKE%3d&tabid=1856&portalid=0&mid=8638) |  |
| Xitsonga First Additional Language | 2017 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ZJU4txDx5bc%3d&tabid=1856&portalid=0&mid=8638) |  |
| Xitsonga First Additional Language | 2017 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=y5_L7ghwh7k%3d&tabid=1856&portalid=0&mid=8638) |  |
| Xitsonga First Additional Language | 2015 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=dsq_rRjNTzA%3d&tabid=979&portalid=0&mid=4308) |  |
| Xitsonga First Additional Language | 2015 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=niu5m-dRTXA%3d&tabid=979&portalid=0&mid=4308) |  |
| Xitsonga First Additional Language | 2015 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=IW3jArmMwrw%3d&tabid=979&portalid=0&mid=4308) |  |
| Xitsonga Home Language | 2025 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=uwnT_fTEzO0%3d&tabid=5742&portalid=0&mid=14823) |  |
| Xitsonga Home Language | 2025 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=n7SRyjB4-iA%3d&tabid=5742&portalid=0&mid=14823) |  |
| Xitsonga Home Language | 2025 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=HaUBtqqSPNQ%3d&tabid=5742&portalid=0&mid=14823) |  |
| Xitsonga Home Language | 2024 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=-qGJUuZYDmY%3d&tabid=5193&portalid=0&mid=13701) |  |
| Xitsonga Home Language | 2024 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=3NXAKmFke7U%3d&tabid=5193&portalid=0&mid=13701) |  |
| Xitsonga Home Language | 2024 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=5IbQjj0-caY%3d&tabid=5193&portalid=0&mid=13701) |  |
| Xitsonga Home Language | 2023 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=54OdJIcuBLc%3d&tabid=4682&portalid=0&mid=12658) |  |
| Xitsonga Home Language | 2023 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=lV7ZlczrNek%3d&tabid=4682&portalid=0&mid=12658) |  |
| Xitsonga Home Language | 2023 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ARLEa0nXYwI%3d&tabid=4682&portalid=0&mid=12658) |  |
| Xitsonga Home Language | 2022 | P1 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=z-eOlK4Ylrw%3d&tabid=3138&portalid=0&mid=10552) |  |
| Xitsonga Home Language | 2022 | P2 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=_47v8q054lw%3d&tabid=3138&portalid=0&mid=10552) |  |
| Xitsonga Home Language | 2022 | P3 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=izGOnHNSCGs%3d&tabid=3138&portalid=0&mid=10552) |  |
| Xitsonga Home Language | 2021 | P1 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=dq_9rgL_1w8%3d&tabid=2922&portalid=0&mid=10175) |  |
| Xitsonga Home Language | 2021 | P2 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=F-0PzqEB0Fk%3d&tabid=2922&portalid=0&mid=10175) |  |
| Xitsonga Home Language | 2021 | P3 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=NhADuqdfn2k%3d&tabid=2922&portalid=0&mid=10175) |  |
| Xitsonga Home Language | 2020 | P1 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=2f8aiFYatAM%3d&tabid=2702&portalid=0&mid=10159) |  |
| Xitsonga Home Language | 2020 | P2 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=JqY8oTOxNV0%3d&tabid=2702&portalid=0&mid=10159) |  |
| Xitsonga Home Language | 2020 | P3 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Nwxtmb4MVuY%3d&tabid=2702&portalid=0&mid=10159) |  |
| Xitsonga Home Language | 2019 | P1 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=3hWY5lMVDDM%3d&tabid=2468&portalid=0&mid=8922) |  |
| Xitsonga Home Language | 2019 | P2 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=niwOKFpS8wA%3d&tabid=2468&portalid=0&mid=8922) |  |
| Xitsonga Home Language | 2019 | P3 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=DyHgZXD8SJ4%3d&tabid=2468&portalid=0&mid=8922) |  |
| Xitsonga Home Language | 2018 | P1 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=SEK_hIKnOsA%3d&tabid=1920&portalid=0&mid=7574) |  |
| Xitsonga Home Language | 2018 | P2 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=YcINN5nkir4%3d&tabid=1920&portalid=0&mid=7574) |  |
| Xitsonga Home Language | 2018 | P3 | no_log | - | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=9POtbpAcNYM%3d&tabid=1920&portalid=0&mid=7574) |  |
| Xitsonga Home Language | 2017 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ynf5ayQUsrs%3d&tabid=1856&portalid=0&mid=8638) |  |
| Xitsonga Home Language | 2017 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=TF-Y5L_I4VE%3d&tabid=1856&portalid=0&mid=8638) |  |
| Xitsonga Home Language | 2017 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=jBrX_QybA4E%3d&tabid=1856&portalid=0&mid=8638) |  |
| Xitsonga Home Language | 2016 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=JPVZ1YzyPJI%3d&tabid=1000&portalid=0&mid=4413) |  |
| Xitsonga Home Language | 2016 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=TbThh6HuKYQ%3d&tabid=1000&portalid=0&mid=4413) |  |
| Xitsonga Home Language | 2016 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=tTq5XlL_hUg%3d&tabid=1000&portalid=0&mid=4413) |  |
| Xitsonga Home Language | 2015 | P1 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=cbMjtwieoSk%3d&tabid=979&portalid=0&mid=4308) |  |
| Xitsonga Home Language | 2015 | P2 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=SJlGrSSeW68%3d&tabid=979&portalid=0&mid=4308) |  |
| Xitsonga Home Language | 2015 | P3 | no_log | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=uz68omz2Y1Q%3d&tabid=979&portalid=0&mid=4308) |  |
| isiNdebele First Additional Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Dys-9iTs-8A%3d&tabid=5742&portalid=0&mid=14814) |  |
| isiNdebele First Additional Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=t2UeVmjB5Ms%3d&tabid=5742&portalid=0&mid=14814) |  |
| isiNdebele First Additional Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=n7EciNvxghY%3d&tabid=5742&portalid=0&mid=14814) |  |
| isiNdebele First Additional Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Ap2a5ptD75A%3d&tabid=5193&portalid=0&mid=13692) |  |
| isiNdebele First Additional Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Wl_6KlTN_Qo%3d&tabid=5193&portalid=0&mid=13692) |  |
| isiNdebele First Additional Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=HR0wTI8NO1M%3d&tabid=5193&portalid=0&mid=13692) |  |
| isiNdebele First Additional Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=b_zFuK-vYBE%3d&tabid=4682&portalid=0&mid=12649) |  |
| isiNdebele First Additional Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=X-yjq9-Js5A%3d&tabid=4682&portalid=0&mid=12649) |  |
| isiNdebele First Additional Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=QNXvXTanx9M%3d&tabid=4682&portalid=0&mid=12649) |  |
| isiNdebele First Additional Language | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=8r0evIld0bE%3d&tabid=1856&portalid=0&mid=7321) |  |
| isiNdebele First Additional Language | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=y7Ig2iOhCgs%3d&tabid=1856&portalid=0&mid=7321) |  |
| isiNdebele First Additional Language | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=8JKuNd25DP0%3d&tabid=1856&portalid=0&mid=7321) |  |
| isiNdebele First Additional Language | 2015 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=bgJcqTfytvw%3d&tabid=979&portalid=0&mid=4300) |  |
| isiNdebele First Additional Language | 2015 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=rwLKPYUNqrY%3d&tabid=979&portalid=0&mid=4300) |  |
| isiNdebele First Additional Language | 2015 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ISWuf41vx84%3d&tabid=979&portalid=0&mid=4300) |  |
| isiNdebele Home Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=r4p9-kddppY%3d&tabid=5742&portalid=0&mid=14814) |  |
| isiNdebele Home Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=bjF1P23Cf8M%3d&tabid=5742&portalid=0&mid=14814) |  |
| isiNdebele Home Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=2pPVVZF78v4%3d&tabid=5742&portalid=0&mid=14814) |  |
| isiNdebele Home Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=B0FoDAKSX1Q%3d&tabid=5193&portalid=0&mid=13692) |  |
| isiNdebele Home Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=qgNC9LM64EM%3d&tabid=5193&portalid=0&mid=13692) |  |
| isiNdebele Home Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=tS2B6S68Ztg%3d&tabid=5193&portalid=0&mid=13692) |  |
| isiNdebele Home Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=CQJjconfnXA%3d&tabid=4682&portalid=0&mid=12649) |  |
| isiNdebele Home Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=8X9_iuV3Qtw%3d&tabid=4682&portalid=0&mid=12649) |  |
| isiNdebele Home Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=WNOR9e6ZTPQ%3d&tabid=4682&portalid=0&mid=12649) |  |
| isiNdebele Home Language | 2018 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=KVTi4chZ100%3d&tabid=1920&portalid=0&mid=7566) |  |
| isiNdebele Home Language | 2018 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=doGaCRn6xmk%3d&tabid=1920&portalid=0&mid=7566) |  |
| isiNdebele Home Language | 2018 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=3Zo97R_T9xY%3d&tabid=1920&portalid=0&mid=7566) |  |
| isiNdebele Home Language | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=9Ps9WOwGTmY%3d&tabid=1856&portalid=0&mid=7321) |  |
| isiNdebele Home Language | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=1Aehe80sMM8%3d&tabid=1856&portalid=0&mid=7321) |  |
| isiNdebele Home Language | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ZuLH828r2So%3d&tabid=1856&portalid=0&mid=7321) |  |
| isiNdebele Home Language | 2016 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Va4Vxg_Ti7w%3d&tabid=1000&portalid=0&mid=4415) |  |
| isiNdebele Home Language | 2016 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=IhMZ8d_B1WA%3d&tabid=1000&portalid=0&mid=4415) |  |
| isiNdebele Home Language | 2016 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=AOqY6CP9l7Y%3d&tabid=1000&portalid=0&mid=4415) |  |
| isiNdebele Home Language | 2015 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=-Aw6Ksxw_Jo%3d&tabid=979&portalid=0&mid=4300) |  |
| isiNdebele Home Language | 2015 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=CdVH5_vS4_g%3d&tabid=979&portalid=0&mid=4300) |  |
| isiNdebele Home Language | 2015 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=6T-EVhlj4-Y%3d&tabid=979&portalid=0&mid=4300) |  |
| isiNdebele Second Additional Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=murtMWr5atw%3d&tabid=5742&portalid=0&mid=14814) |  |
| isiNdebele Second Additional Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=L4X7WZyGvxI%3d&tabid=5742&portalid=0&mid=14814) |  |
| isiNdebele Second Additional Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ieVpOJmkHKE%3d&tabid=5742&portalid=0&mid=14814) |  |
| isiNdebele Second Additional Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=gCFaFdvwwo8%3d&tabid=5193&portalid=0&mid=13692) |  |
| isiNdebele Second Additional Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=J_V7KjH1OlQ%3d&tabid=5193&portalid=0&mid=13692) |  |
| isiNdebele Second Additional Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=J7Z68uZDmXQ%3d&tabid=5193&portalid=0&mid=13692) |  |
| isiNdebele Second Additional Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=2XM-8nxRgss%3d&tabid=4682&portalid=0&mid=12649) |  |
| isiNdebele Second Additional Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=qPYs7nnGLx4%3d&tabid=4682&portalid=0&mid=12649) |  |
| isiNdebele Second Additional Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=vmaNDeeNaIs%3d&tabid=4682&portalid=0&mid=12649) |  |
| isiXhosa First Additional Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=cUkXQDadm18%3d&tabid=5742&portalid=0&mid=14815) |  |
| isiXhosa First Additional Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Q2RjNsc9NI8%3d&tabid=5742&portalid=0&mid=14815) |  |
| isiXhosa First Additional Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=SJyz-8H9pLc%3d&tabid=5742&portalid=0&mid=14815) |  |
| isiXhosa First Additional Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=29-s28IqI84%3d&tabid=5193&portalid=0&mid=13693) |  |
| isiXhosa First Additional Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=IdNz4rAfspg%3d&tabid=5193&portalid=0&mid=13693) |  |
| isiXhosa First Additional Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=fHgoVcJts5Y%3d&tabid=5193&portalid=0&mid=13693) |  |
| isiXhosa First Additional Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=gyN4myeCEVc%3d&tabid=4682&portalid=0&mid=12650) |  |
| isiXhosa First Additional Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=9w3NfMhfiZM%3d&tabid=4682&portalid=0&mid=12650) |  |
| isiXhosa First Additional Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=f4oiQtSIbbo%3d&tabid=4682&portalid=0&mid=12650) |  |
| isiXhosa First Additional Language | 2021 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ktFdot117Qk%3d&tabid=2922&portalid=0&mid=10176) |  |
| isiXhosa First Additional Language | 2021 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=200qEXrJJSo%3d&tabid=2922&portalid=0&mid=10176) |  |
| isiXhosa First Additional Language | 2021 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=kHWHVud1BpQ%3d&tabid=2922&portalid=0&mid=10176) |  |
| isiXhosa First Additional Language | 2019 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=TBAPr1gCwME%3d&tabid=2468&portalid=0&mid=8912) |  |
| isiXhosa First Additional Language | 2019 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=FhLpIoBSbKc%3d&tabid=2468&portalid=0&mid=8912) |  |
| isiXhosa First Additional Language | 2019 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=zBt4FGbmmIg%3d&tabid=2468&portalid=0&mid=8912) |  |
| isiXhosa First Additional Language | 2018 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=mgiPPEmfMyM%3d&tabid=1920&portalid=0&mid=7567) |  |
| isiXhosa First Additional Language | 2018 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=rip-Ht0g4D4%3d&tabid=1920&portalid=0&mid=7567) |  |
| isiXhosa First Additional Language | 2018 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=WKpNkc_bpOU%3d&tabid=1920&portalid=0&mid=7567) |  |
| isiXhosa First Additional Language | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=udkBn4xIMR8%3d&tabid=1856&portalid=0&mid=7322) |  |
| isiXhosa First Additional Language | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=gmdAxDUMVwg%3d&tabid=1856&portalid=0&mid=7322) |  |
| isiXhosa First Additional Language | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=TVFzRfPRstM%3d&tabid=1856&portalid=0&mid=7322) |  |
| isiXhosa First Additional Language | 2016 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=yg74HeznkvQ%3d&tabid=1000&portalid=0&mid=4416) |  |
| isiXhosa First Additional Language | 2016 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=5KDhYfYLaUk%3d&tabid=1000&portalid=0&mid=4416) |  |
| isiXhosa First Additional Language | 2016 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=tp_ZVFxiY_k%3d&tabid=1000&portalid=0&mid=4416) |  |
| isiXhosa First Additional Language | 2015 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=7Is6btWyYLE%3d&tabid=979&portalid=0&mid=4301) |  |
| isiXhosa First Additional Language | 2015 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=C3K7sAAMDzI%3d&tabid=979&portalid=0&mid=4301) |  |
| isiXhosa First Additional Language | 2015 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=LP_S3dgs0c0%3d&tabid=979&portalid=0&mid=4301) |  |
| isiXhosa Home Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=WkbhyZw76jo%3d&tabid=5742&portalid=0&mid=14815) |  |
| isiXhosa Home Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=n7po5g-p75E%3d&tabid=5742&portalid=0&mid=14815) |  |
| isiXhosa Home Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=z0e0SE1oyR0%3d&tabid=5742&portalid=0&mid=14815) |  |
| isiXhosa Home Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=oMN6vj9dAGI%3d&tabid=5193&portalid=0&mid=13693) |  |
| isiXhosa Home Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=zopc0r_JJ0Q%3d&tabid=5193&portalid=0&mid=13693) |  |
| isiXhosa Home Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=a7TAJg2y6gQ%3d&tabid=4682&portalid=0&mid=12650) |  |
| isiXhosa Home Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=hTQPWqkgdBI%3d&tabid=4682&portalid=0&mid=12650) |  |
| isiXhosa Home Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=yX4uxK-gi-c%3d&tabid=4682&portalid=0&mid=12650) |  |
| isiXhosa Home Language | 2022 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=lOqgrwHMYoM%3d&tabid=3138&portalid=0&mid=10545) |  |
| isiXhosa Home Language | 2022 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=u8ky4hbH0s8%3d&tabid=3138&portalid=0&mid=10545) |  |
| isiXhosa Home Language | 2022 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=XDuMYAmaEJA%3d&tabid=3138&portalid=0&mid=10545) |  |
| isiXhosa Home Language | 2021 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=QGThXR_NqpY%3d&tabid=2922&portalid=0&mid=10176) |  |
| isiXhosa Home Language | 2021 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=_c_MpuG_WiI%3d&tabid=2922&portalid=0&mid=10176) |  |
| isiXhosa Home Language | 2021 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=h8iqXqGncPE%3d&tabid=2922&portalid=0&mid=10176) |  |
| isiXhosa Home Language | 2019 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=DZtF1Z6rJ04%3d&tabid=2468&portalid=0&mid=8912) |  |
| isiXhosa Home Language | 2019 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=J-Jocca0Jbw%3d&tabid=2468&portalid=0&mid=8912) |  |
| isiXhosa Home Language | 2018 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=DSHoWYVYAdU%3d&tabid=1920&portalid=0&mid=7567) |  |
| isiXhosa Home Language | 2018 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=PliqxSKvT64%3d&tabid=1920&portalid=0&mid=7567) |  |
| isiXhosa Home Language | 2018 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=7cqn5TnIkDo%3d&tabid=1920&portalid=0&mid=7567) |  |
| isiXhosa Home Language | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=St3GpoDFYvA%3d&tabid=1856&portalid=0&mid=7322) |  |
| isiXhosa Home Language | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=KEd84D5y8yE%3d&tabid=1686&portalid=0&mid=6735) |  |
| isiXhosa Home Language | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=ZLpe2Xg2i0E%3d&tabid=1856&portalid=0&mid=7322) |  |
| isiXhosa Home Language | 2016 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=q9nSP-qieJU%3d&tabid=1000&portalid=0&mid=4416) |  |
| isiXhosa Home Language | 2016 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Wj3YM6ea_Kw%3d&tabid=1000&portalid=0&mid=4416) |  |
| isiXhosa Home Language | 2016 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=SbRJu0SnwHE%3d&tabid=1000&portalid=0&mid=4416) |  |
| isiXhosa Home Language | 2015 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=qAUsDbr8EhY%3d&tabid=979&portalid=0&mid=4301) |  |
| isiXhosa Home Language | 2015 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=DPuIjx9h9XM%3d&tabid=979&portalid=0&mid=4301) |  |
| isiXhosa Home Language | 2015 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=5fQcjBVDyXE%3d&tabid=979&portalid=0&mid=4301) |  |
| isiXhosa Second Additional Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=HmUs4M9bwWs%3d&tabid=5742&portalid=0&mid=14815) |  |
| isiXhosa Second Additional Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=eb_KqoOg-ec%3d&tabid=5742&portalid=0&mid=14815) |  |
| isiXhosa Second Additional Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=6PRxJQVG7yA%3d&tabid=5742&portalid=0&mid=14815) |  |
| isiXhosa Second Additional Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=OhoLKrVdwy0%3d&tabid=5193&portalid=0&mid=13693) |  |
| isiXhosa Second Additional Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=FVW5qdGi0qI%3d&tabid=5193&portalid=0&mid=13693) |  |
| isiXhosa Second Additional Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=I4J_-_mjrAY%3d&tabid=5193&portalid=0&mid=13693) |  |
| isiXhosa Second Additional Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=AQnNUJKwv-k%3d&tabid=4682&portalid=0&mid=12650) |  |
| isiXhosa Second Additional Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=6t0gJcys5A0%3d&tabid=4682&portalid=0&mid=12650) |  |
| isiXhosa Second Additional Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=7iHxhB1JAtM%3d&tabid=4682&portalid=0&mid=12650) |  |
| isiXhosa Second Additional Language | 2021 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=JIErXATmKyU%3d&tabid=2922&portalid=0&mid=10176) |  |
| isiXhosa Second Additional Language | 2021 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=RfM7cAoxAjE%3d&tabid=2922&portalid=0&mid=10176) |  |
| isiXhosa Second Additional Language | 2021 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=XyzMN6NAHeE%3d&tabid=2922&portalid=0&mid=10176) |  |
| isiZulu First Additional Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=DG9XvhJblMM%3d&tabid=5742&portalid=0&mid=14816) |  |
| isiZulu First Additional Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=1bnRAfafM-U%3d&tabid=5193&portalid=0&mid=13694) |  |
| isiZulu First Additional Language | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=NBx6xnh5O7E%3d&tabid=5193&portalid=0&mid=13694) |  |
| isiZulu First Additional Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=tEyK-z4XxOE%3d&tabid=5193&portalid=0&mid=13694) |  |
| isiZulu First Additional Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=iMqEQl4TjHc%3d&tabid=4682&portalid=0&mid=12651) |  |
| isiZulu First Additional Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=PY_VFtFsWxQ%3d&tabid=4682&portalid=0&mid=12651) |  |
| isiZulu First Additional Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=62cFWJHXDTY%3d&tabid=4682&portalid=0&mid=12651) |  |
| isiZulu First Additional Language | 2021 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=XyCh5RRyIto%3d&tabid=2922&portalid=0&mid=10179) |  |
| isiZulu First Additional Language | 2021 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=8ckonYd_6L0%3d&tabid=2922&portalid=0&mid=10179) |  |
| isiZulu First Additional Language | 2021 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=brCuJe8gBqg%3d&tabid=2922&portalid=0&mid=10179) |  |
| isiZulu First Additional Language | 2019 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=vnctOBQvAfQ%3d&tabid=2468&portalid=0&mid=8913) |  |
| isiZulu First Additional Language | 2019 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=JVoWqoAupPI%3d&tabid=2468&portalid=0&mid=8913) |  |
| isiZulu First Additional Language | 2019 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=CJose4i779o%3d&tabid=2468&portalid=0&mid=8913) |  |
| isiZulu First Additional Language | 2018 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=a9hQsTurdFU%3d&tabid=1920&portalid=0&mid=7568) |  |
| isiZulu First Additional Language | 2018 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=6vczNumY9Qo%3d&tabid=1920&portalid=0&mid=7568) |  |
| isiZulu First Additional Language | 2018 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=BFJAj4OXsjE%3d&tabid=1920&portalid=0&mid=7568) |  |
| isiZulu First Additional Language | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=TPkY_BUX3RY%3d&tabid=1856&portalid=0&mid=7323) |  |
| isiZulu First Additional Language | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=2UEah8NpE7U%3d&tabid=1856&portalid=0&mid=7323) |  |
| isiZulu First Additional Language | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=YJ_OvuaHMGk%3d&tabid=1856&portalid=0&mid=7323) |  |
| isiZulu First Additional Language | 2016 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=oEvKdCItaSI%3d&tabid=1000&portalid=0&mid=4417) |  |
| isiZulu First Additional Language | 2016 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=yQifRxx-j44%3d&tabid=1000&portalid=0&mid=4417) |  |
| isiZulu First Additional Language | 2016 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Q-ubOYOy8zE%3d&tabid=1000&portalid=0&mid=4417) |  |
| isiZulu First Additional Language | 2015 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=eibW7hiK0VQ%3d&tabid=979&portalid=0&mid=4302) |  |
| isiZulu First Additional Language | 2015 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=79LRlMyWP_w%3d&tabid=979&portalid=0&mid=4302) |  |
| isiZulu First Additional Language | 2015 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=xEeCI9kx010%3d&tabid=979&portalid=0&mid=4302) |  |
| isiZulu Home Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Hbs5V1w1Mzw%3d&tabid=5742&portalid=0&mid=14816) |  |
| isiZulu Home Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=S6JMYKzGo98%3d&tabid=5742&portalid=0&mid=14816) |  |
| isiZulu Home Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=bvw1UfawqmQ%3d&tabid=5742&portalid=0&mid=14816) |  |
| isiZulu Home Language | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=F8drA157nug%3d&tabid=5193&portalid=0&mid=13694) |  |
| isiZulu Home Language | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=kqRI3EgLat8%3d&tabid=5193&portalid=0&mid=13694) |  |
| isiZulu Home Language | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=BfP-rQiQs-E%3d&tabid=4682&portalid=0&mid=12651) |  |
| isiZulu Home Language | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=zkE45YlGa5Y%3d&tabid=4504&portalid=0&mid=12287) |  |
| isiZulu Home Language | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=sIjTCbBClmM%3d&tabid=4682&portalid=0&mid=12651) |  |
| isiZulu Home Language | 2019 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=_gTikE1MTFs%3d&tabid=2468&portalid=0&mid=8913) |  |
| isiZulu Home Language | 2019 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=_bUB3XgBz-A%3d&tabid=2468&portalid=0&mid=8913) |  |
| isiZulu Home Language | 2019 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=d31CtYBReXo%3d&tabid=2468&portalid=0&mid=8913) |  |
| isiZulu Home Language | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=dZ6dYL2Wsjo%3d&tabid=1856&portalid=0&mid=7323) |  |
| isiZulu Home Language | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=wwazYNSJeDM%3d&tabid=1856&portalid=0&mid=7323) |  |
| isiZulu Home Language | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=DnzkgBcNp64%3d&tabid=1856&portalid=0&mid=7323) |  |
| isiZulu Home Language | 2016 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Rxeq_lT-y70%3d&tabid=1000&portalid=0&mid=4417) |  |
| isiZulu Home Language | 2016 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=QjexnyR1xFc%3d&tabid=1000&portalid=0&mid=4417) |  |
| isiZulu Home Language | 2016 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=4mozM0oFS-o%3d&tabid=1000&portalid=0&mid=4417) |  |
| isiZulu Home Language | 2015 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=reM_S1qa_e4%3d&tabid=979&portalid=0&mid=4302) |  |
| isiZulu Home Language | 2015 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=wTxqITB9BKI%3d&tabid=979&portalid=0&mid=4302) |  |
| isiZulu Home Language | 2015 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=aMLi-sS4Hfo%3d&tabid=979&portalid=0&mid=4302) |  |
| isiZulu Second Additional Language | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=NLs6On_97qs%3d&tabid=5742&portalid=0&mid=14816) |  |
| isiZulu Second Additional Language | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=FgZw46v2Ua0%3d&tabid=5742&portalid=0&mid=14816) |  |
| isiZulu Second Additional Language | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=mkAviOtqzcM%3d&tabid=5742&portalid=0&mid=14816) |  |
| isiZulu Second Additional Language | 2021 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=PZPptlu94RY%3d&tabid=2922&portalid=0&mid=10179) |  |
| isiZulu Second Additional Language | 2021 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=TDQoA5tf2v4%3d&tabid=2922&portalid=0&mid=10179) |  |
| isiZulu Second Additional Language | 2021 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=XkiSzlDlIU8%3d&tabid=2922&portalid=0&mid=10179) |  |
| siSwati | 2025 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=nsWLFNgYt3c%3d&tabid=5742&portalid=0&mid=14821) |  |
| siSwati | 2025 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=wsaoNiSjYs4%3d&tabid=5742&portalid=0&mid=14821) |  |
| siSwati | 2025 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=3SuZlGejkdc%3d&tabid=5742&portalid=0&mid=14821) |  |
| siSwati | 2024 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=U46VnMxwSaM%3d&tabid=5193&portalid=0&mid=13699) |  |
| siSwati | 2024 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=e60xFyb_tF8%3d&tabid=5193&portalid=0&mid=13699) |  |
| siSwati | 2024 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=5vLNH-URwBY%3d&tabid=5193&portalid=0&mid=13699) |  |
| siSwati | 2023 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=7lctV6UpbQA%3d&tabid=4682&portalid=0&mid=12656) |  |
| siSwati | 2023 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=6xL-FINcUdo%3d&tabid=4682&portalid=0&mid=12656) |  |
| siSwati | 2023 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=aXeC5--dffM%3d&tabid=4682&portalid=0&mid=12656) |  |
| siSwati | 2022 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=bovX3qo7RyE%3d&tabid=3138&portalid=0&mid=10550) |  |
| siSwati | 2022 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=6huI2PO0LBg%3d&tabid=3138&portalid=0&mid=10550) |  |
| siSwati | 2022 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=-vFVLJwkI7M%3d&tabid=3138&portalid=0&mid=10550) |  |
| siSwati | 2021 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=DvpoYisORVI%3d&tabid=2922&portalid=0&mid=10173) |  |
| siSwati | 2021 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=CrOc-YcSFaA%3d&tabid=2922&portalid=0&mid=10173) |  |
| siSwati | 2021 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=B5rpAwND7FA%3d&tabid=2922&portalid=0&mid=10173) |  |
| siSwati | 2020 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=z8489ts2nDU%3d&tabid=2702&portalid=0&mid=10162) |  |
| siSwati | 2020 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=Vx3km6-4AEE%3d&tabid=2702&portalid=0&mid=10162) |  |
| siSwati | 2020 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=u4z_1Xtkzys%3d&tabid=2702&portalid=0&mid=10162) |  |
| siSwati | 2019 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=tyVExpMv4r0%3d&tabid=2468&portalid=0&mid=8920) |  |
| siSwati | 2019 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=CAoqT5ERYQM%3d&tabid=2468&portalid=0&mid=8920) |  |
| siSwati | 2019 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=cFlW9jUW7Ic%3d&tabid=2468&portalid=0&mid=8920) |  |
| siSwati | 2018 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=hLRyt2VF5jQ%3d&tabid=1920&portalid=0&mid=7572) |  |
| siSwati | 2018 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=SADHvIpzCtk%3d&tabid=1920&portalid=0&mid=7572) |  |
| siSwati | 2018 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=1hSPLJKqE8w%3d&tabid=1920&portalid=0&mid=7572) |  |
| siSwati | 2017 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=CBFpuzuH_QI%3d&tabid=1856&portalid=0&mid=8633) |  |
| siSwati | 2017 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=4pqm_3I8DzM%3d&tabid=1856&portalid=0&mid=8633) |  |
| siSwati | 2017 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=5ybcaAN6DH4%3d&tabid=1856&portalid=0&mid=8633) |  |
| siSwati | 2016 | P1 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=r4nHTGW33hY%3d&tabid=1000&portalid=0&mid=4421) |  |
| siSwati | 2016 | P2 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=6OFthEV5oHc%3d&tabid=1000&portalid=0&mid=4421) |  |
| siSwati | 2016 | P3 | stuck_blob | 1 | 1 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=r5LDEmDbzuM%3d&tabid=1000&portalid=0&mid=4421) |  |
| siSwati | 2015 | P1 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=sDEwp7zwulk%3d&tabid=979&portalid=0&mid=4306) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| siSwati | 2015 | P2 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=AAOtVMMohOg%3d&tabid=979&portalid=0&mid=4306) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |
| siSwati | 2015 | P3 | failed | - | 0 | [pdf](https://www.education.gov.za/LinkClick.aspx?fileticket=MKWMre6zV8o%3d&tabid=979&portalid=0&mid=4306) | HTTP 403 Access Denied — DBE site blocked this request after 3 attempts: https:/ |

## AI splitter sanity-test (live evidence)

The AI fallback `aiSplitLanguagePaper` (`server/dbe-ingestion.ts:607`) was invoked directly against the cached paper text for **isiZulu Home Language 2024 P1** during this task's investigation. With the current `AI_INTEGRATIONS_OPENAI_API_KEY` in place, the call returned **11 properly split, numbered questions** (1.1, 1.2, …) — proving the splitter is healthy. Bantu papers were stuck because the previous reingestion ran without the OpenAI key available, so the function silently returned an empty array and the code fell back to the "store the whole paper as Q1" path.

## Reproducing this verification

```bash
# 1. Kick off the queued reingest (long-running; safe in background)
npx tsx scripts/reingest-bantu-languages.ts

# 2. Re-run this report; exits 1 while any HL/FAL paper is not OK
npx tsx scripts/verify-bantu-ingestion.ts

# 3. Spot-check the learner UI for any Bantu subject
#    open /dbe-practice and pick a paper for that subject
```