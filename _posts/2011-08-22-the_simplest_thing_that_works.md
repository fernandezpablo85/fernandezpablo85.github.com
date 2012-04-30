Most likely, you've heard that phrase. The full version is:

What's the simplest thing that could possibly work?

It was coined by Ward Cunningham, one of the smartest hackers out there.

I knew the term for a long time, but it wasn't until a few months that I actually found myself in a situation that made me actually "get it". It was kind of an "aha moment" that I'd like to share here.

I maintain an opensource library, called Scribe, that lets you make OAuth calls without all the boilerplate. A while ago, a ticket was created to support a particular feature.

Basically, the library makes an http request, obtains a response and parses the contents. The contents are pretty much standard stuff (though some providers are too smart-ass to give a fuck about the spec).

What you get back is a string that looks like this:

`oauth_token=random_string_here&oauth_token_secret=random_string_here`

After some parsing using simple regular expressions (doing regexes in java is as fun as getting shot at, BTW), the lib creates this simple object, called Token, that lets you easily access the token and secret.

But again, some smart providers send you extra info there, and the string becomes:

`oauth_token=random_string_here&oauth_token_secret=random_string_here&random_string_here=random_string_here`

With the original Token class we don't handle this scenario. So, for this case, scribe no longer "works".

The guy that pointed this to me also contributed a nice patch with his solution. There are some problems with his patch, though:

Touchs 5 files and adds ~60 LOC.
Adds a public (overloaded) api call.
Now we are passing a Map<String, String> around as a parameter, something not cool.
Not only that but the map is passed to be modified (kind of an "output" param, ouch!)
It only works for access_tokens, not for request_tokens (this is more OAuth-specific stuff so don't worry about it).
What this solution does is basically return a Map<String,String> with the additional stuff that comes in the response as key-value pairs. 

Is this a bad solution? not at all, the code works and the user gets more or less what he/she wants. But the library now has to inspect the string, parse it, create a map and change the public APIs to return it. It's kind of an overkill IMHO.

Here's where "The simplest thing that works" came to my mind. I now have a different interpretation of this concept that I'd like to draw to you guys here:



The idea is that the graph represents increasing complexity. Near the "simple" end, things are straightforward, easy to maintain and to use, on the "complex" end you get maintenance nightmares, your users don't like your lib and send you hate mail or bitch about it on Twitter.

I've marked 3 points on the graph:

A - The original Token class. Dead simple and easy to maintain, but it doesn't "work" (since it doesn't handle the extra params).
B - The ideal solution. Simple enough, and works.
C - The contributed patch. It works, but it increases complexity and it's harder to maintain.
I believe now that finding that 'B spot' is what Cunningham meant by saying those words.

This is the solution that finally got into the lib. I believe it's pretty close to B, because:

It's short (about ~15 LOC).
It works for both cases (request and access tokens).
It doesn't involve any additional parsing (doesn't introduce new bugs).
It doesn't modify the public APIs with strange overloads (Just a new constructor signature, on an object that is always constructed by the lib).
It does have a drawback: users now have to parse the raw string instead of having a nice map structure. But perhaps they didn't want a map in the first place, and also, you must never forget the scope of your code; In the case of Scribe it is OAuth-signing http requests, not parsing strings or making utility methods.

That's it. Next time you have a problem in your hands, just sit back and think "What is the simplest thing that could possibly work?". Who knows? Perhaps you'll find a simple and future-proof solution, just like me.