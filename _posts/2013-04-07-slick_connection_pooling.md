---
layout: default
title: Slick Connection Pooling
hnlink: http://news.ycombinator.com/item?id=5130823
---

# Meet Slick

[Slick](http://slick.typesafe.com) (formerly ScalaQuery) is a nice scala library for accessing your database, works with many vendors and it's part of the typesafe stack.

Slick's [documentation](http://slick.typesafe.com/docs/) is *awesome* to get you started quickly. Unfortunately there are some important topics missing from the docs or examples which are mandatory for using it in a production environment.

# A simple example

Let's create a data access object and a main `App` to exercise it. Following the official docs this is kinda trivial:

<script src="https://gist.github.com/fernandezpablo85/5332371.js">_</script>

Great! A few things to note:

* The code is elegant and simple.

* There is a minor workaround needed to use auto-increment fields in postgress. More info can be found in this [Stack Overflow question](http://stackoverflow.com/questions/13199198/using-auto-incrementing-fields-with-postgresql-and-slick). Also, I've filed [a ticket](https://github.com/slick/slick/issues/131) for it so it's hopefully going to get fixed soon.

Unfortunately, this code as it is **can never go to production.** 

# What's wrong with that?

This code does not use a database connection pool. If you used other ORM or high-level DAO libraries you probably didn't have to think about that since the framework/library handled it automatically for you. Slick doesn't.

So? well this means that for every database session (`withSession` blocks) Slick is opening a **new connection to the database server**.

The cost of creating and closing a connection every time is prohibitive. We need to reuse them.

# Meet c3p0

[C3PO](http://sourceforge.net/projects/c3p0/) is a versatile and highly tunable connection pool library used by many ORMs (e.g. Hibernate). It has [really good docs](http://www.mchange.com/projects/c3p0/) too, with information about every configuration value.

Let's put it to work. Check this line:

{% highlight scala %}
Database.forURL("jdbc:postgresql://localhost:5432/demo", driver = "org.postgresql.Driver")
{% endhighlight %}

We use Slick's [Database](http://slick.typesafe.com/doc/1.0.0/api/index.html#scala.slick.session.Database) object to create a new database instance from a jdbc url. The scaladocs say that's not the only way of getting a `Database` instance, we can also get one from a `javax.sql.Datasource`.

c3p0 has a class called `ComboPooledDataSource` which works as a pooled and configurable version of `Datasource`:

<script src="https://gist.github.com/fernandezpablo85/5332497.js">_</script>

With the pool in place, let's run some benchmarks to check the performance improvement, for this I'm gonna use this little [benchmarking snippet](https://gist.github.com/fernandezpablo85/5293930)

<pre>
RESULTS (without connection pool):
--------
 
mean:   29 ms 
50% :   28 ms 
75% :   30 ms 
90% :   33 ms 
99% :   39 ms 
</pre>

<pre>
RESULTS (with connection pool):
--------
 
mean:   12 ms 
50% :   12 ms 
75% :   14 ms 
90% :   15 ms 
99% :   16 ms 
</pre>

Indeed we cut our response times by **50%**! Neat!

# Should we really worry about 10 msecs?

Yes. We should.

The absolute numbers here are deceiving since most of the time saved is **network overhead**, which is not a lot when both the database server and the application run on the same box. This is common in a development environment like this but not likely in production.

Let's run these benchmarks against a remote and thus high latency postgress server, using [Heroku](https://postgres.heroku.com) (note that I live in Argentina so latency is higher than you may experience):

<pre>
RESULTS (without connection pool):
--------
 
mean:   8069 ms 
50% :   7985 ms 
75% :   8393 ms 
90% :   9523 ms 
99% :   9523 ms 
</pre>

<pre>
RESULTS (with connection pool):
--------
 
mean:   816 ms 
50% :   786 ms 
75% :   883 ms 
90% :   953 ms 
99% :   953 ms 
</pre>

# Conclusion

Slick is great and has fantastic docs but sometimes to get past the getting started example you need to hack a bit. Never use it (or any data access lib) in prod without a database connection pool.

(all code available at this [github repository](https://github.com/fernandezpablo85/slick-production-tips/commits?author=fernandezpablo85))