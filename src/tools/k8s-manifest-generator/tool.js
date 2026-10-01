/* K8s Manifest Generator — app inputs → Deployment + Service multi-doc YAML. */
(function () {
  'use strict';
  var SLUG = 'k8s-manifest-generator';
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'app';
  }

  function generate() {
    clear();
    var name = slugify(el(SLUG + '-name').value.trim());
    var image = el(SLUG + '-image').value.trim();
    if (!image) { fail('Enter a container image.'); return; }
    var replicas = Math.max(1, Math.min(50, parseInt(el(SLUG + '-replicas').value, 10) || 1));
    var port = Math.max(1, Math.min(65535, parseInt(el(SLUG + '-port').value, 10) || 80));
    var svcPort = Math.max(1, Math.min(65535, parseInt(el(SLUG + '-svcport').value, 10) || 80));
    var svcType = el(SLUG + '-svctype').value;
    var ns = el(SLUG + '-namespace').value.trim() || 'default';
    var envLines = [];
    el(SLUG + '-env').value.split('\n').forEach(function (l) {
      l = l.trim();
      if (!l) return;
      var i = l.indexOf('=');
      if (i < 0) { envLines.push('        - name: ' + JSON.stringify(l)); }
      else envLines.push('        - name: ' + JSON.stringify(l.slice(0, i).trim()) + '\n          value: ' + JSON.stringify(l.slice(i + 1).trim()));
    });
    var yaml =
      'apiVersion: apps/v1\n' +
      'kind: Deployment\n' +
      'metadata:\n  name: ' + name + '\n  namespace: ' + ns + '\n  labels:\n    app: ' + name + '\n' +
      'spec:\n  replicas: ' + replicas + '\n  selector:\n    matchLabels:\n      app: ' + name + '\n' +
      '  template:\n    metadata:\n      labels:\n        app: ' + name + '\n' +
      '    spec:\n      containers:\n      - name: ' + name + '\n        image: ' + image + '\n' +
      '        ports:\n        - containerPort: ' + port + '\n' +
      (envLines.length ? '        env:\n' + envLines.join('\n') + '\n' : '') +
      '---\n' +
      'apiVersion: v1\n' +
      'kind: Service\n' +
      'metadata:\n  name: ' + name + '\n  namespace: ' + ns + '\n' +
      'spec:\n  type: ' + svcType + '\n  selector:\n    app: ' + name + '\n' +
      '  ports:\n  - protocol: TCP\n    port: ' + svcPort + '\n    targetPort: ' + port + '\n';
    el(SLUG + '-output').value = yaml;
  }

  try {
    if (!el(SLUG + '-generate')) return;
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the YAML first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate the YAML first.'); return; }
      TN.downloadText(v, 'deployment.yaml', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
