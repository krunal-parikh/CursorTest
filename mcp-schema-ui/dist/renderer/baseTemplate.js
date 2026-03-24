/**
 * Base template source - the full rendering logic passed to Claude.
 * User can customize: colors (--color-*), typography (--font-*), spacing (--spacing-*), layout (grid/flex).
 */
export const BASE_TEMPLATE_SOURCE = `<!--
  BASE UI TEMPLATE - Schema-driven form renderer
  ===========================================
  This template renders any schema. The schema is embedded in <script id="schema-data">.
  
  CUSTOMIZATION (edit the :root CSS variables):
  - Colors: --color-primary, --color-primary-hover, --color-text, --color-border, --color-bg
  - Typography: --font-family, --font-size-base, --font-size-title, --font-weight-label
  - Spacing: --spacing-unit, --form-gap, --form-max-width
  - Layout: .form-grid uses CSS Grid; change grid-template-columns for column layout
-->

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Schema Form</title>
  <style>
    :root {
      /* Colors - change these to customize */
      --color-primary: #2563eb;
      --color-primary-hover: #1d4ed8;
      --color-text: #1f2937;
      --color-border: #d1d5db;
      --color-bg: #ffffff;
      --color-success: #16a34a;
      --color-error: #dc2626;
      
      /* Typography */
      --font-family: system-ui, -apple-system, sans-serif;
      --font-size-base: 1rem;
      --font-size-title: 1.5rem;
      --font-weight-label: 500;
      
      /* Spacing & layout */
      --spacing-unit: 0.5rem;
      --form-gap: 1rem;
      --form-max-width: 600px;
    }
    
    * { box-sizing: border-box; }
    body {
      font-family: var(--font-family);
      font-size: var(--font-size-base);
      color: var(--color-text);
      background: var(--color-bg);
      max-width: var(--form-max-width);
      margin: 2rem auto;
      padding: 0 1rem;
    }
    h1 {
      font-size: var(--font-size-title);
      margin-bottom: 1.5rem;
    }
    .form-grid {
      display: grid;
      gap: var(--form-gap);
      /* Single column by default; use "1fr 1fr" for 2 columns */
      grid-template-columns: 1fr;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: calc(var(--spacing-unit) * 0.5);
    }
    label {
      font-weight: var(--font-weight-label);
    }
    input, select, textarea {
      width: 100%;
      padding: var(--spacing-unit);
      font-size: var(--font-size-base);
      font-family: var(--font-family);
      border: 1px solid var(--color-border);
      border-radius: 4px;
    }
    button {
      padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
      font-size: var(--font-size-base);
      font-family: var(--font-family);
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover { background: var(--color-primary-hover); }
    .success { color: var(--color-success); margin-top: var(--form-gap); }
    .error { color: var(--color-error); margin-top: var(--form-gap); }
  </style>
</head>
<body>
  <h1 id="form-title">Form</h1>
  <form id="schema-form">
    <div id="form-fields" class="form-grid"></div>
    <button type="submit">Submit</button>
  </form>
  <div id="message"></div>
  
  <script id="schema-data" type="application/json">SCHEMA_PLACEHOLDER</script>
  <script>
    const SCHEMA = JSON.parse(document.getElementById("schema-data").textContent);
    
    function renderField(field) {
      const comp = field["ui.component"] || "text";
      if (comp === "hidden") return "";
      const id = "field-" + field.field_name;
      const required = field.required ? " required" : "";
      let input = "";
      if (comp === "select" && (field.options?.length || field.datasourceRef)) {
        const opts = field.options || [];
        const optionsHtml = opts.map(o => '<option value="' + (o.value || "").replace(/"/g, "&quot;") + '">' + (o.label || o.value || "") + '</option>').join("");
        input = '<select id="' + id + '" name="' + field.field_name + '"' + required + '><option value="">Select...</option>' + optionsHtml + '</select>';
      } else if (comp === "number") {
        input = '<input type="number" id="' + id + '" name="' + field.field_name + '"' + required + '>';
      } else if (comp === "date") {
        input = '<input type="date" id="' + id + '" name="' + field.field_name + '"' + required + '>';
      } else if (comp === "textarea") {
        input = '<textarea id="' + id + '" name="' + field.field_name + '" rows="3"' + required + '></textarea>';
      } else {
        input = '<input type="text" id="' + id + '" name="' + field.field_name + '"' + required + '>';
      }
      return '<div class="form-group"><label for="' + id + '">' + (field.label || field.field_name) + '</label>' + input + '</div>';
    }
    
    function render() {
      document.getElementById("form-title").textContent = SCHEMA.schemaKey?.replace(/:/g, " - ") || "Form";
      const fields = SCHEMA.fieldConfig?.fields || [];
      document.getElementById("form-fields").innerHTML = fields.map(renderField).join("");
    }
    
    document.getElementById("schema-form").onsubmit = function(e) {
      e.preventDefault();
      const data = {};
      for (const el of e.target.elements) {
        if (el.name && el.value !== undefined) data[el.name] = el.value;
      }
      document.getElementById("message").innerHTML = '<div class="success">Form data: ' + JSON.stringify(data, null, 2) + '</div>';
    };
    render();
  </script>
</body>
</html>`;
//# sourceMappingURL=baseTemplate.js.map