// Blog Page Code

// Don't know if this is needed or not.
<script src="/scripts/md5.js"></script>

<script>

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if(pair[0] == variable){return pair[1];}
    }
    return(false);
  }


  function getPage(page) {
    if(page>maxPages){
      return false;
    }
    var catVar='';
    if(category!==false){
      	console.log('category='+category);
     	catVar='&category='+category;
      	$('#main-navigation li.active-link').removeClass('active-link');
      	$('#main-navigation a[href="/blog?category='+category+'"').parent('li').addClass('active-link');
    }
    $('#spinster').show();
    loading=1;
    var url='/blog?page='+page+catVar;
    if(page==1){
      url='/blog?format=json'+catVar;
    }
    console.log(url);
    $.ajax({
      url: url
    }).done(function(response) {
      if(page>1){

        var newposts=$('.hentry',response).length;
        if(newposts>0){
          $.each($('.hentry',response),function(k,v){
            var post=$(v).clone(true);
            $('nav.page.pagination').before(post);
          });
        } else {
         	maxPages=page;
        }
      } else {
        pageSize=response.collection.pageSize;
        itemCount=response.collection.itemCount;
        maxPages=Math.ceil(itemCount/pageSize);
        console.log('Total Pages:',maxPages);
      }
      $('#spinster').hide();
      loading=0;
    });
  }


  var page=1;
  var itemCount=0;
  var pageSize=0;
  var maxPages=1;
  var loading=0;
  var category='';
  function pageCode() {
    $('#content').append('<div id="spinster"><img src="/s/spinny.gif"></div>');

    category=getQueryVariable("category");


    getPage(page);
    $(window).scroll(function(){
      if($(window).scrollTop() > ($('#page-footer').position().top - $(window).height())) {
        if(loading<1 && page>0){
          page=page+1;
          getPage(page);
        }
      }
    });
  }



  function infiniteScroll2(parent, post) {
    console.log('infscroll');
    // Set some variables. We'll use all these later.
    var postIndex = 1,
        hash=0,
        prevhash=1,
        eod=false,
        completed=false,
        execute = true,
        stuffBottom = Y.one(parent).get('clientHeight') + Y.one(parent).getY(),
        urlQuery = window.location.pathname,
        postNumber = Static.SQUARESPACE_CONTEXT.collection.itemCount,
        presentNumber = Y.all(post).size();

    if(urlQuery !== '/blog/'){
      return false;
    }
    Y.on('scroll', function() {
      if(eod===true){
        return false;
      } else {

        // A few more variables.
        var spaceHeight = document.documentElement.clientHeight + window.scrollY,
            next = false;

        /*
                This if statement measures if the distance from
                the top of the page to the bottom of the content
                is less than the scrollY position. If it is,
                it's sets next to true.
            */
        if (stuffBottom < spaceHeight && execute === true) {
          next = true;
        }

        if (next === true) {

          /*
                    Immediately set execute back to false.
                    This prevents the scroll listener from
                    firing too often.
                */
          execute = false;

          // Increment the post index.
          postIndex++;

          // Make the Ajax request.
          if(eod!==true){
            console.log("QUERY:"+urlQuery);
            Y.io(urlQuery + '?page=' + postIndex, {
              on: {
                success: function (x, o) {
                  try {
                    d = Y.DOM.create(o.responseText);
                    hash = CryptoJS.MD5(o.responseText).toString();
                    console.log(hash);
                    if(hash==prevhash){
                      eod=true;
                    }
                    prevhash=hash;

                  } catch (e) {
                    console.log("JSON Parse failed!");
                    return;
                  }

                  // Append the contents of the next page to this page.
                  if(eod===true){
                    Y.one(parent).append('<h1>There are no more posts.</h1>');
                  } else {
                    Y.one(parent).append(Y.Selector.query(parent, d, true).innerHTML);
                  }
                  // Reset some variables.
                  stuffBottom = Y.one(parent).get('clientHeight') + Y.one(parent).getY();
                  presentNumber = Y.all(post).size();
                  execute = true;

                }
              }
            });

          }

        }
      }
    });
  }

  // Call the function on domready.
  Y.use('node', function() {
    Y.on('domready', function() {
      console.log('ready');
      //infiniteScroll('#content','.lazy-post');
    });
  });


</script>
