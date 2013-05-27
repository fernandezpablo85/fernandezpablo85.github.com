---
layout: default
title: Building a Firehose API with Play
hnlink: https://news.ycombinator.com/item?id=5508873
---

# Firehose who?

This is a tutorial about building your own twitter-firehose-like API. That may sound complex but it actually is an http endpoint that serves a never ending stream of (in this case) status updates.

If you're not familiar with the concept check [Twitter's stream API docs](https://dev.twitter.com/docs/streaming-apis).

**All code is available as a github project [here](https://github.com/fernandezpablo85/play-streaming).**

# The building blocks

For this task we are going to use the fantastic Play! framework. If you happen to code in scala or java and do not know Play! stop reading this and [go check it out](http://playframework.com). I'm serious. Go now. This article will be here waiting for you.

Particularly we're going to use Play's `play.api.iteratee` classes. This package is powerful but a bit complex, don't worry though, we won't be using a lot of advanced iteratees/enumerators here, just a few convenience classes.

If you want to learn more about iteratees, there are [some](http://jazzy.id.au/default/2012/11/06/iteratees_for_imperative_programmers.html) [good](http://mandubian.com/2012/08/27/understanding-play2-iteratees-for-normal-humans/) [resources](http://jsuereth.com/scala/2012/02/29/iteratees.html) online.

# Broadcast

Like I said the code is available on [this github repo](https://github.com/fernandezpablo85/play-streaming) so I'm not going to copy all of it, just the relevant bits.

We are going to use `Concurrent.broadcast` for the core of our streaming API.

<script src="https://gist.github.com/fernandezpablo85/5654676.js">_</script>

You can think about `stream` as a subscriber of the `channel`, when we push stuff on a channel it will get passed through.

With this in mind, it's kinda obvious that we need to start pushing the generated updates to the `channel` and then somehow putting the `stream` on our users browsers. Let's generate the updates first.

# Sending updates

We are going to periodically send random updates, using a scheduler:

<script src="https://gist.github.com/fernandezpablo85/5654705.js">_</script>

We're using Akka for this but it's just an implementation detail. What that means is that we're sending about 20 random messages/second to the channel.

# Streaming the updates

Okay so we have a `channel` that's being filled with updates, let's put that into our users browsers!

Uhm, looks like [`SimpleResult`](http://www.playframework.com/documentation/api/2.1.1/scala/index.html#play.api.mvc.SimpleResult) (which is the type our controllers need to return) accepts an [`Enumerator`](http://www.playframework.com/documentation/api/2.1.1/scala/index.html#play.api.libs.iteratee.Enumerator). Recall that our `stream` *is* an `Enumerator`, so let's return that:

<script src="https://gist.github.com/fernandezpablo85/5654743.js">_</script>

Looks great right? Let's run it and...

<script src="https://gist.github.com/fernandezpablo85/5654761.js">_</script>

Nope. It doesn't work. What that means is that Play doesn't know how to write a `StatusUpdate` to an http request body. And it makes sense, Play can't possibly know how we want our object rendered.

Play does know though, how to put a [`JsValue`](http://www.playframework.com/documentation/api/2.1.1/scala/index.html#play.api.libs.json.JsValue) (the representation of a JSON value) into an http request. Let's see how we turn any case class into a `JsValue`:

<script src="https://gist.github.com/fernandezpablo85/5654780.js">_</script>

Awesome! That `json` instance we can return. Now if only our stream was made of `JsValue`s and not of our own `StatusUpdate`s ...

# Enter Enumeratee

You *could* create a `channel` of JsValue but it would tie your stream to a specific representation, and we don't want that (MVC, blah blah blah).

Wouldn't it be great if we could "map" our `StatusUpdate` stream to a `JsValue` stream? In fact that's exactly why the [`Enumeratee`](http://www.playframework.com/documentation/api/2.1.1/scala/index.html#play.api.libs.iteratee.Enumeratee) exist (Yes, naming is hard, I know):

<script src="https://gist.github.com/fernandezpablo85/5654794.js">_</script>

Cool! This `jsonStream` we can return in our `SimpleResult`!

# Test the thing

Open a terminal, fire `play run` to start the app and then `curl localhost:9000/firehose`. 

You have just created your first streaming API! :D Congratulations, You rock!

# Conclusions

* Iteratees, Enumerators and Enumeratees are not very easy to grasp but you can get *a lot done* just by using some parts, like `Concurrent.broadcast`.

* Create one generic, transport agnostic stream and then adapt it to your needs with `Enumeratees`. This will let you use the same stream with different implementations (for example Server Sent events, coming up in an next blog post!)

* Play! is wonderful. You must give it a try.

* Streaming APIs, though not super-useful are cool.

