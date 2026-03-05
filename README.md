## ♿ Accessibility & Medical Necessity Notice
This suite is developed as an **Assistive Technology (AT)** accommodation. 

- **Visual Impairment Support**: Specifically engineered to provide high-contrast alerts and enlarged safety shields for users with partial blindness or localized vision loss.
- **ADA/WCAG Alignment**: This script functions as a client-side "lens," similar to a screen magnifier or high-contrast browser setting, ensuring the 3CX PWA remains accessible and safe for users with visual disabilities.
- **Safety Lock**: Prevents accidental data entry errors caused by vision-related difficulty in monitoring standard character counters.

# 🛡️ PWA Enhancement Suite (SMS Guard)

A collection of community-driven userscripts designed to enhance the usability and carrier-compliance of the 3CX PWA (Web Client). 

## 📖 Overview
These scripts address long-standing UX gaps, specifically focusing on **SMS character limits**. Since the 3CX PWA does not natively convert long messages to MMS or provide a character counter, these tools provide a necessary "safety net" for high-stakes environments like medical offices.

### Features
- **Visual Alerts**: Sliding CSS banners when exceeding 160 characters.
- **Smart Blocking**: (Optional) Prevents the `Enter` key or Send button from triggering when over the limit to avoid message fragmentation.
- **Client-Side Only**: Zero modification to server-side code or proprietary binaries.

## 🛠️ Installation
1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net).
2. Click the "Raw" link for any `.user.js` file in this repository.
3. Your browser will prompt you to install the script.

## ⚖️ Legal & License (AGPL-3.0)
This project is released under the **GNU Affero General Public License v3.0**. 

### Prior Art & Intellectual Property
The specific architectural blueprints, logic, and DOM-manipulation strategies contained herein constitute **Prior Art**. 
- **Commercial Entities**: Under the AGPL-3.0, if you utilize this logic or integrate these specific architectural designs into a network-based service (SaaS), you are legally obligated to make the source code of that interacting interface available to your users under the same terms.
- **No Affiliation**: This project is independent and is NOT affiliated with, endorsed by, or integrated with 3CX.

### Disclaimer
This software is provided "as-is" for the purpose of enhancing user experience. It does not interfere with the security, integrity, or performance of the underlying service. Users are responsible for ensuring compliance with their specific EULA.

---
**"Keep the web open. Contribute back. Hack the Planet."**
