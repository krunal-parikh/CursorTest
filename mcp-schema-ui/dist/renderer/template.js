/**
 * Generates a self-contained HTML form that renders a schema.
 * Claude can render this in an artifact and the user can modify it.
 */
export function generateFormRendererHtml(schema) {
    const schemaJson = JSON.stringify(schema)
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")
        .replace(/&/g, "\\u0026");
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Schema Form</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; font-weight: 500; margin-bottom: 0.25rem; }
    input, select, textarea { width: 100%; padding: 0.5rem; font-size: 1rem; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 0.75rem 1.5rem; font-size: 1rem; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #1d4ed8; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .error { color: #dc2626; margin-top: 0.5rem; }
    .success { color: #16a34a; margin-top: 0.5rem; }
    h1 { margin-bottom: 1.5rem; }
  </style>
</head>
<body>
  <h1 id="form-title">Form</h1>
  <form id="schema-form">
    <div id="form-fields"></div>
    <button type="submit" id="submit-btn">Submit</button>
  </form>
  <div id="message"></div>
  <script id="schema-data" type="application/json">${schemaJson}</script>

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
      const form = e.target;
      const data = {};
      for (const el of form.elements) {
        if (el.name && el.value !== undefined) data[el.name] = el.value;
      }
      document.getElementById("message").innerHTML = '<div class="success">Form data (preview): ' + JSON.stringify(data, null, 2) + '</div>';
    };
    
    render();
  </script>
</body>
</html>`;
}
//# sourceMappingURL=template.js.map