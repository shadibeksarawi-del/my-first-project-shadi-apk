/* جسر الموبايل: يعمل فقط داخل تطبيق Capacitor ولا يؤثر على المتصفح العادي */
(function () {
  var C = window.Capacitor;
  if (!C || !(C.isNativePlatform && C.isNativePlatform())) return;
  var FS = C.registerPlugin('Filesystem'), SH = C.registerPlugin('Share'), BR = C.registerPlugin('Browser');

  // الطباعة وحفظ PDF عبر واجهة الطباعة الأصلية في أندرويد
  window.print = function () { if (window.AndroidPrint && window.AndroidPrint.print) window.AndroidPrint.print(); };

  // الروابط الخارجية (مثل صفحة الاستعلام) تُفتح في متصفح مدمج
  window.open = function (u) { if (/^https?:/.test(u)) BR.open({ url: u }); return null; };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (a && /^https?:/.test(a.href)) { e.preventDefault(); BR.open({ url: a.href }); }
  }, true);

  // تصدير Word/Excel: يُحفظ الملف مؤقتاً ثم تُفتح قائمة المشاركة (حفظ في الملفات، واتساب، بريد...)
  function saveShare(url, name) {
    fetch(url).then(function (r) { return r.blob(); }).then(function (b) {
      return new Promise(function (res, rej) { var f = new FileReader(); f.onload = function () { res(String(f.result).split(',')[1]); }; f.onerror = rej; f.readAsDataURL(b); });
    }).then(function (b64) { return FS.writeFile({ path: name, data: b64, directory: 'CACHE' }); })
      .then(function (r) { return SH.share({ title: name, url: r.uri, dialogTitle: 'حفظ أو مشاركة الملف' }); })
      .catch(function (e) { if (!(e && /cancel/i.test(String(e.message || e)))) alert('تعذر حفظ الملف: ' + ((e && e.message) || e)); });
  }
  var orig = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.download && /^blob:/.test(this.href)) { saveShare(this.href, this.download); return; }
    return orig.apply(this, arguments);
  };
})();
