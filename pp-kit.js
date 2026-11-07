/* Prana patient-page kit: tap-to-play patient videos, hide missing illustrations, prefill booking step 1 */
(function(){
  function ready(f){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',f):f()}
  ready(function(){
    // Tap-to-play videos (no download until tapped)
    document.querySelectorAll('.pk-vid[data-src]').forEach(function(fig){
      fig.addEventListener('click',function(){
        if(fig.classList.contains('on')) return;
        var v=document.createElement('video');
        v.src=fig.getAttribute('data-src'); v.controls=true; v.autoplay=true; v.playsInline=true; v.setAttribute('playsinline','');
        var img=fig.querySelector('img'); if(img) img.replaceWith(v); else fig.appendChild(v);
        fig.classList.add('on');
        try{window.dataLayer&&dataLayer.push({event:'patient_video_play',video:fig.getAttribute('data-src')})}catch(e){}
      });
    });
    // If an illustration file is missing, remove its slot instead of showing a broken image
    document.querySelectorAll('.pk-ill img').forEach(function(img){
      function gone(){var f=img.closest('.pk-ill'); if(f){var t=f.closest('.pk-top'); f.remove(); if(t) t.style.gridTemplateColumns='1fr';}}
      if(img.complete && img.naturalWidth===0) gone(); else img.addEventListener('error',gone);
    });
    // Prefill step 1 of the booking popup with this page's treatment
    var svc=document.body.getAttribute('data-svc');
    if(svc!==null){
      var done=false;
      new MutationObserver(function(){
        var o=document.getElementById('pdb-o');
        if(!o||!o.classList.contains('on')){done=false;return;}
        if(done) return;
        var b=o.querySelector('.pdb-opt[data-i="'+svc+'"]');
        if(b){done=true; setTimeout(function(){b.click()},60);}
      }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    }
  });
})();
