(function (global) {

  var $global = $(global);
  var content, darkBox, searchInfo;
  var highlightOpts = { element: 'span', className: 'search-highlight' };

  var index = new lunr.Index;

  index.ref('id');
  index.field('title', { boost: 10 });
  index.field('body');
  index.pipeline.add(lunr.trimmer, lunr.stopWordFilter);

  $(populate);
  $(bind);

  function populate () {
    $('h1').each(function () {
      var title = $(this);
      var body = title.nextUntil('h1');
      var wrapper = $('<section id="section-' + title.prop('id') + '"></section>');

      title.after(wrapper.append(body));
      wrapper.prepend(title);

      index.add({
        id: title.prop('id'),
        title: title.text(),
        body: body.text()
      });
    });
  }

  function bind () {
    content = $('.content');
    darkBox = $('.dark-box');
    searchInfo = $('.search-info');

    $('#input-search')
      .on('keyup', search)
      .on('focus', active)
      .on('blur', inactive);
  }

  function resetHeaderCounts() {
     var headers = $(".tocify-header");
     $.each(headers, function (index, item) {
       $("#" + item.id + " li span").remove();
     });
   }

  function search (event) {
    searchInfo.hide();
    unhighlight();
    resetHeaderCounts();

    // ESC clears the field
    if (event.keyCode === 27) this.value = '';

    if (this.value) {
      var results = index.search(this.value);
      if (results.length) {
        var counts = {};
        $.each(results, function (index, item) {
          if (!counts[item.ref]) counts[item.ref] = 0;
          counts[item.ref] += 1;
        });
        $.each(counts, function (key, value) {
          var header = $('.tocify-item[data-unique=' + key + ']').closest('.tocify-header');
          if (header.length > 0) header = header[0];
          if (header) $("#" + header.id + " li a").append("<span>&nbsp;</span>");
        });
        highlight.call(this);
      } else {
        searchInfo.text('No Results Found for "' + this.value + '"').show();
      }
    }

    // HACK trigger tocify height recalculation
    $global.triggerHandler('scroll.tocify');
    $global.triggerHandler('resize');
  }

  function active () {
    search.call(this, {});
  }

  function inactive () {
    unhighlight();
    searchInfo.hide();
  }

  function highlight () {
    if (this.value) content.highlight(this.value, highlightOpts);
  }

  function unhighlight () {
    content.unhighlight(highlightOpts);
  }

})(window);