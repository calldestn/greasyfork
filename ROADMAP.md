## 🗺️ Roadmap: SIP Messaging & Accessibility

Current development focus: **Encoding Accuracy and Visual Inclusion.**

### 📡 SMS/SIP Encoding Precision
- [ ] **Encoding Detection (GSM 03.38 vs. UCS-2)**
  - Automatically switch the character limit from 160 (GSM) to 70 (Unicode) if non-GSM characters are detected.
- [ ] **Extended GSM Character Handling**
  - Correctly count "double-slot" characters (e.g., `|`, `^`, `{`, `}`, `[`, `]`, `~`, and `\`) against the 160 limit.
- [ ] **Grapheme-Aware Counting**
  - Implement logic to treat multi-codepoint emojis and ZWJ sequences as single visual glyphs.
- [ ] **Multi-Segment Billing Calculator**
  - Display the number of billable segments (e.g., "155/160 | 1 Segment" vs "75/70 | 2 Segments").

### 👁️ Enhanced Accessibility
- [ ] **High Contrast Mode**
  - Inject CSS overrides to ensure a 7:1 contrast ratio for text and UI elements, following WCAG AAA standards.
- [ ] **Color-Blind Friendly Palettes**
  - Implement "Deuteranopia" and "Protanopia" safe color schemes for status indicators (e.g., success/error messages).
- [ ] **Dynamic Language Detection**
  - Detect browser/document locale to adjust counting rules for international DID requirements.
