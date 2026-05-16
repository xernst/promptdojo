---
xp: 1
estSeconds: 150
concept: pwd-and-ls
---

# pwd: where am I. ls: what's here.

Two commands. They're the ones you'll run most, because they answer
the two questions you'll ask most: where am I, and what's around me.

## pwd

`pwd` stands for "print working directory." Working directory is the
same thing we called your current directory: the folder you're
standing in. Type it and press enter:

```
pwd
```

It prints the full path from the top of the tree down to where you
are:

```
/Users/maya/Documents
```

Read that right to left: you're in `Documents`, which is inside
`maya`, which is inside `Users`. The leading `/` is the very top of
the whole tree. `pwd` never changes anything. It just answers "where
am I." Run it any time you feel lost. You will feel lost sometimes,
and `pwd` is the cure.

## ls

`ls` stands for "list." It shows what's inside the folder you're
standing in. Type it and press enter:

```
ls
```

```
Desktop    Documents    Downloads    notes.txt
```

That's the contents of where you are: three folders and one file, in
this example. `ls` doesn't move you and doesn't change anything. It
just shows you the room you're in.

Run both right now in your open terminal. `pwd` tells you the address.
`ls` tells you the furniture. Between them you always know where you
stand, and that's most of what "being good at the terminal" actually
is.
