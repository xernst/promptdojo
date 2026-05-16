---
xp: 1
estSeconds: 150
concept: mkdir-and-touch
---

# mkdir makes a folder. touch makes a file.

Moving around is half of it. The other half is making things. Two
commands cover most of it.

## mkdir

`mkdir` stands for "make directory." Give it a name, it makes a folder
with that name, inside wherever you're standing:

```
mkdir projects
```

Run `ls` afterward and `projects` is in the listing. You just made a
folder by typing eight characters. No right-click, no "New Folder", no
renaming an "untitled folder." It's the kind of small thing that adds
up once it's a habit.

You can make several at once by listing names with spaces:

```
mkdir drafts final archive
```

Three folders, one line. This is the repeatability thing from the
overview, in its smallest form.

## touch

`touch` makes a new, empty file:

```
touch notes.txt
```

Run `ls` and `notes.txt` is there: a real file, empty, ready for you
to open in any editor. The `.txt` part is the file extension, the same
`.txt`, `.pdf`, `.xlsx` you already know. You pick the name and the
extension; `touch` just creates it.

(`touch` has a second job, updating a file's timestamp, which is where
the odd name comes from. You can ignore that. For you, `touch` means
"make an empty file.")

## Try both

In your terminal: `mkdir practice`, then `cd practice` to step inside,
then `touch hello.txt`, then `ls` to see your new file sitting in your
new folder. You just built a small piece of a filesystem by hand. That
is the entire job.
