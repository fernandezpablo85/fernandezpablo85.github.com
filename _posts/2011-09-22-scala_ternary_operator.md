---
layout: default
title: Scala Ternary Operator
---

# Scala

I've been working with [scala](http://scala-lang.org) lately and I can tell you: it is one of the best programming languages I've ever used. It's expressive, succinct and fun to write. It also runs on the JVM with little configuration and its performance is as good as java (it's probably one of the few JVM languages that achieves this). It has, though, one big problem:

*It doesn't have the ternary operator.*

I'm actually saying this tongue-in-cheek since the if statement in scala is an expression (it has a return value). What you would do if you'd like to have ternary-like behavior in scala would be:

<script src="https://gist.github.com/1306603.js">_</script>

Good uh? But let's face it, **the ternary operator is badass** (I'm not kidding, I love that little prick).

# Filling the gap

Fear not, though, since scala has some cool features that will let us create something quite similar. Our home-made ternary operator will look like this:

<script src="https://gist.github.com/1306611.js">_</script>

Note that we're using a pipe `|` instead of a colon `:`, because of the way scala handles the colon in method identifiers. I won't dig into this, trust me when I say we cannot use the colon here.

# Version One

Let's start, we need a Ternary class with some methods, a first shot at it would be:

<script src="https://gist.github.com/1306619.js">_</script>

Great stuff right? Well no, it actually looks like crap. No worries though, all first versions do, let's improve it. We don't want that 'options' method there, it would be better to have two methods, one for the true path and another for false one. We also want to make the two look **less like method calls and more like a baked-in thing**, let's see:

<script src="https://gist.github.com/1306626.js">_</script>

# Make it generic

Making progress now, the `yes` and `no` method handle both cases, also since scala lets us use operator-like notation for every method, we can leave the dots and parens out. There's a big problem that has been with us for a while now: the fact that **our methods take strings.** 

For this example that's fine, but we want our ternary operator to handle not just strings but anything, even our own objects. To change this we simply add a new class with a type annotation, like this:

<script src="https://gist.github.com/1306630.js">_</script>

Great! We just added a new class `TernaryResultHandler`. It's created with our `yes` method, and from then it takes care of the conditional logic. This should be pretty familiar for most java programmers. (Note that it's a scala convention to use A instead of T for type annotations)

# Getting rid of yes and no

Now we can use any object for our yes and no methods. Talking about these, they have to go. Hope you didn't get too attached to them. Scala is more flexible with the identifiers than java, it will let us name our methods using almost any character, like `?` for example.

As a matter of fact when you do `2 + 2` in scala, you are actually doing `2.+(2)` (remember that we could leave dots and parens out?). 

This is awesome for Api design, and it's a great design decision since it doesn't involve additional concepts like operators: **Everything is a method**. Enough talking let's improve our code once more:

<script src="https://gist.github.com/1306637.js">_</script>

Cool, uh? Our example is pretty much done, the only thing that doesn't look very neat there is the whole Ternary thing, if only we could open up Boolean and add the `?` method like the ruby guys do...

# Implicit Conversions

Scala doesn't allow [monkeypatching](http://en.wikipedia.org/wiki/Monkey_patch), this is a good thing since [monkeypatching kinda sucks](http://avdi.org/devblog/2008/02/23/why-monkeypatching-is-destroying-ruby/). Even the ruby guys know this and [they are doing something about it](http://www.rubyinside.com/ruby-refinements-an-overview-of-a-new-proposed-ruby-feature-3978.html). 

Scala has something which is sort of a more controlled cousin of monkeypatching, implicit conversions.

Implicit conversions are beyond the scope of this blog post and I'm just bringing this up since it will make our `Ternary` class super-awesome. If you want to learn more about implicits [read this](http://www.codecommit.com/blog/ruby/implicit-conversions-more-powerful-than-dynamic-typing). This is the last version of our class:

<script src="https://gist.github.com/1306673.js">_</script>

Wow, what the fuck is all that? 

Well the scala compiler first sees we're trying to invoke the `?` method on Boolean. Instead of saying "WTF dude?" (or more politely, `NoSuchMethodError`) it checks for implicit conversions _in scope_. It finds ours, sees that the return type is `Ternary` and (surprise!) that it happens to have the `?` method defined.

This is **why implicits are more controlled than monkeypatching**. We didn't force every boolean out there to implement the `?` method, just the ones that are in the scope of our conversion (again, for more info check the previously linked article).

# Conclusion

This is probably a silly example, and the first alternative (using the if expression) is nicer. It does however illustrate the underlying power of scala. [You should really give it a try](http://scala-lang.org), it's a pretty neat language and really easy to adopt if your code is already running on the JVM.