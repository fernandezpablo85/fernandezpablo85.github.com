---
layout: default
title: Never Return Null
---

# Origin

Most programming languages have a representation of nothing. Java has `null`, Scala has `Unit`, ruby has `nil`, javascript has quite a few terms itself, and so on. From now on I'm going to refer to all of those as `null` for simplicity's sake.

Null origin's can be traced to ALGOL. It was invented by [Tony Hoare](http://en.wikipedia.org/wiki/Tony_Hoare), while he was creating a reference system for his language. He calls it [his billon dollar mistake](http://qconlondon.com/london-2009/presentation/Null+References%3A+The+Billion+Dollar+Mistake).

As with most mistakes in our industry, it looked as a good idea at that time:

> My goal was to ensure that all use of references should be absolutely safe, with checking performed automatically by the compiler. But I couldn't resist the temptation to put in a null reference, simply because it was so easy to implement.

The rest is history.

# The Problem

What's wrong with null? Well, the thing is that it acts like a time bomb. Consider the following snippet of java code:

<script src="https://gist.github.com/1144225.js">_</script>

This code might not seem strange to you. In fact it's pretty common stuff. 

The problem here is that we're living in a world of fantasy from the time we ask for the Person object. The fantasy ends when we try to actually use the object, and find out we've been fooled and our friend `null` lives in there.

How soon do we find out? Well it can be soon enough, or (as in the example) it can take a few lines of code and some method invocations. In the latter case, debugging becomes harder since we have to backtrack our steps and see where we get the `null` reference the first time.

# The Solution

Does this mean that we have to check for nulls every time we get a reference from somewhere? No, please. That would pollute the code, making it harder to read and introducing a new set of bugs. But we can (and must) avoid returning null references.

I'll say it out loud: **There's not a single scenario when returning a null reference is a good idea.**

It is obvious that when you do have something to return, you just return that. But what happens when have nothing to return? Well you have a few alternatives:

## Empty equivalent version of the object

Suppose your method returns the lowerCase representation of a String (e.g. it takes "Hello World" and returns "hello world"). If your method receives a null reference, an empty string or another thing of which you can't calculate the lower-case version, just return an empty string. For methods returning collections or arrays, always return empty (perhaps also immutable) versions of them.

## NullObject

Often, there is no natural empty representation of the reference you're returning, like in our Person example. In this case, consider creating a [NullObject](http://en.wikipedia.org/wiki/Null_Object_pattern). This is a special instance of the object that has "neutral behavior". Think of it as the empty string or array for complex types like Person.

## Throw an (unchecked) exception

If implementing the NullObject is an overkill, throw an exception. An unchecked one (I believe all exceptions should be unchecked, but that's a matter of another post). This way, the client code will fail as soon as it tries to retrieve something that doesn't exist, but you give them the chance to recover from this error (catching the exception) and implementing some kind of recovery strategy if they want to.

# Some interesting guards against null

Other languages have better protection against null.

C# for example, throws an unchecked exception when a key is not found in a Dictionary (Microsoft calls maps 'Dictionaries'... whatever). In fact all .net exceptions are unchecked, something they got right.

Scala has [the Option class](http://www.scala-lang.org/api/current/scala/Option.html). It's a very elegant solution when you have a method that some times has to return an empty reference.