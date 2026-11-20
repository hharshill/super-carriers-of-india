(function(){
  var WA = '919824625024';

  // sticky nav tint
  var nav = document.getElementById('nav');
  function onScroll(){
    nav.classList.toggle('solid', window.scrollY > 40);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        document.querySelectorAll('[data-parallax]').forEach(function(el){
          el.style.translate = '0 ' + (y * parseFloat(el.dataset.parallax) * 0.35) + 'px';
        });
      }
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // scroll reveal
  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); countUp(e.target); }
      });
    }, {threshold:.15, rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(el){ io.observe(el); });
  } else {
    els.forEach(function(el){ el.classList.add('in'); });
  }

  // counters
  function countUp(root){
    var b = root.querySelector && root.querySelector('[data-count]');
    if (!b || b.dataset.done) return;
    b.dataset.done = 1;
    var to = +b.dataset.count, suf = b.dataset.suffix || '', t0 = performance.now();
    (function tick(t){
      var p = Math.min(1, (t - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
      b.textContent = v + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  // quote form -> WhatsApp
  var form = document.getElementById('quoteForm');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var d = new FormData(form), ok = true;
    ['name','from','to'].forEach(function(k){
      var i = form.elements[k], bad = !String(d.get(k)).trim();
      i.classList.toggle('bad', bad); if (bad) ok = false;
    });
    if (!ok) return;
    var msg = 'Hello Super Carriers of India,\n' +
      'Name: ' + d.get('name') + '\n' +
      'Pickup: ' + d.get('from') + '\n' +
      'Drop: ' + d.get('to') + '\n' +
      'Service: ' + d.get('service') + '\n' +
      'Weight: ' + (d.get('weight') || 'Not sure') + '\n' +
      'Please share a quote.';
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });

  document.getElementById('yr').textContent = new Date().getFullYear();
})();
