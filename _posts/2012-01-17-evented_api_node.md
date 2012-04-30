---
layout: default
title: Evented Apis With Node
---

# Node.js

Lately I've been playing with [node](http://nodejs.org/). If you've been living under a rock and don't know it, node is a set of libraries for javascript, implemented on top of [Google's wonderful V8](http://code.google.com/p/v8/). It's pretty neat. Go check it out.

With node you can create a streaming http client just with a few lines of javascript, like this:

<script src="https://gist.github.com/1623715.js">_</script>

There's a lot of talk going on about node scalability, performance, memory use, etc. This time I want to focus on a different thing: api design.

# Not your regular Api

Let's take the web server example again and see the api that's presented to us:

<script src="https://gist.github.com/1623720.js">_</script>

The response object we get is just a handle for us to subscribe to ([observe](http://en.wikipedia.org/wiki/Observer_pattern)) certain events. While weird at first, this is a really elegant design decision. We don't need to inspect status codes or stuff, we just subscribe to the data event if we want to parse the response, or the error event if we want additional error handling. None of these are mandatory and there are no if/switch statements.

Unfortunately this requires a change in our mindset, it's harder if you're not fond of javascript and specially if you come from a language where functions are not first-class citizens (java).

# A simple example

Don't worry since this is not hard at all, in fact, let's go create our own non-evented api, a simple `Calculator`:

<script src="https://gist.github.com/1623948.js">_</script>

As you can see we now have to check for the value of err (what is err anyway? a flag, an object with error information?) and do some conditional handling. While not very ugly, this whole "2 value callback" is not very elegant. 

What happens if there's another outcome of the method (not just error or data)? In this silly example that's a non-issue, but you sure can tell **this doesn't scale**. Alternatives are passing in another parameter, which would break backwards compatibility, or adding information to the error object, mixing concerns. This is clearly why node developers use the evented api over this err, data thing for non-trivial callbacks.

# An Evented Api

Fear not since doing this is not hard at all, in fact its so simple that we're going to do that now in about the same lines of code:

<script src="https://gist.github.com/1623971.js">_</script>

We're using [EventEmitter](http://nodejs.org/docs/latest/api/events.html), a class that's part of node's library (the object you get from an http response inherits from it too). Feel free to dig into the docs, but the most important methods of it are emit, `which` is used to fire events, and `on` which attaches handlers to particular events. Those handlers receive the parameters provided to the emit method.

# Wrapping up

Our example is really simple, almost stupid, you probably won't see the gain here. But suppose you're clients are only interested in knowing if the sum is negative, you could then emit a negative event. Hopefully you'll see how this scales to more complex apis with a few callbacks.

Is this a silver bullet? should you design all node apis like this? Of course not. But it sure is a good tool to keep close when designing your next node app.

