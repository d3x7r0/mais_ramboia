<article class="pure-g">
    <header class="pure-u-2-5">
        <div class="cover">
            <img src="<%= it.cover %>" alt="<%- it.title %>" />
        </div>
    </header>
    <div class="content pure-u-3-5">
        <h2><%- it.title %></h2>
        <p class="meta"><span class="time"><%= it.duration %></span> (Added by <span class="user"><%- it.user %></span>)</p>
    </div>
</article>