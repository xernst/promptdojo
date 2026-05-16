---
xp: 1
estSeconds: 150
concept: filesystem-tree
---

# Your files are a tree, and you're standing in it

To move around in the terminal, you need a picture of what you're
moving around in. Here it is.

Your files are arranged as a tree. A folder holds files and other
folders, and those folders hold more files and folders, all the way
down. You've seen this a thousand times in your file window. The
terminal uses the exact same tree.

```
home
├── Desktop
├── Documents
│   ├── taxes
│   └── resume.pdf
└── Downloads
```

The one new idea: in the terminal, you are always **standing in one
folder**. Not looking at all of them. Standing in exactly one. That
folder is called your **current directory** ("directory" is just the
old word for folder, and the terminal uses it constantly).

Every command you run happens from where you're standing. `ls` shows
what's in the folder you're in. `mkdir` makes a folder inside the one
you're in. Moving around means changing which folder you're standing
in.

## Two shortcuts worth knowing now

These two symbols show up everywhere:

- `~` means your **home folder**. The top of your personal tree, where
  Desktop, Documents, and Downloads live. When a terminal opens, it
  usually starts you at `~`.
- `..` means **the folder one level up**. The parent of where you're
  standing. If you're in `Documents/taxes` and you go `..`, you land
  in `Documents`.

That's the model. You're standing somewhere in a tree. Commands act on
where you stand. `~` is home, `..` is up. The next three steps are just
the commands for looking around and stepping between folders.
