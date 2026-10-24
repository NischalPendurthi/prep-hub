/* Operating Systems — File Systems */
window.QUESTIONS.push(
  {
    id: "os-fs-001", subject: "os", subtopic: "File Systems", difficulty: "easy", type: "concept",
    question: "In Unix-like file systems, what does an inode store?",
    options: ["The file's name and its data", "The directory tree", "Only the file name", "A file's metadata — type, permissions, owner, size, timestamps, link count — and pointers to its data blocks, but NOT the file name"],
    answer: 3,
    explanation: "Names live in directory entries, which map names to inode numbers. That separation is what makes hard links possible: several names (directory entries) can refer to the same inode. `ls -i` shows inode numbers; `stat` shows inode contents.",
    optionExplanations: ["The name is stored in the directory, and data in data blocks.", "Directories are files containing name → inode entries.", "The name isn't in the inode at all.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-fs-002", subject: "os", subtopic: "File Systems", difficulty: "easy", type: "concept",
    question: "What's the difference between a hard link and a symbolic (soft) link?",
    options: ["They're identical", "Hard links work across file systems; symlinks don't", "A symbolic link copies the data", "A hard link is another directory entry pointing to the SAME inode (equal status with the original name); a symbolic link is a separate small file containing a PATH to the target"],
    answer: 3,
    explanation: "Hard links can't cross file systems (inode numbers are per file system) and normally can't point to directories. Symlinks can point anywhere, including across file systems and to directories, but break if the target is moved or deleted.",
    optionExplanations: ["They work very differently.", "It's the reverse.", "Neither copies data.", "Correct."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-fs-003", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "You run `ln a.txt h.txt` and `ln -s a.txt s.txt`, then `rm a.txt`. What happens when you `cat h.txt` and `cat s.txt`?",
    options: ["Both fail", "Both still work", "cat h.txt still shows the contents (the inode's link count went from 2 to 1, so the data remains); cat s.txt fails with 'No such file or directory' because the symlink now dangles", "cat h.txt fails; cat s.txt works"],
    answer: 2,
    explanation: "rm only removes a directory entry (unlink). The inode and data are freed when the link count reaches 0 AND no process has the file open. A symlink stores the path 'a.txt', which no longer resolves.",
    optionExplanations: ["The hard link keeps the data alive.", "The symlink target no longer exists.", "Correct.", "Reversed."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-fs-004", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "Why can't you create a hard link to a file on a different file system (another partition)?",
    options: ["A hard link is a directory entry containing an inode number, and inode numbers are only meaningful within one file system", "Because of permissions", "Hard links are disabled by default", "Because the other file system is read-only"],
    answer: 0,
    explanation: "Each mounted file system has its own inode table. Symbolic links store a path instead, so they can cross file-system boundaries.",
    optionExplanations: ["Correct.", "Permissions aren't the reason.", "Hard links are a standard feature.", "Read-only status isn't the reason."]
  },
  {
    id: "os-fs-005", subject: "os", subtopic: "File Systems", difficulty: "easy", type: "concept",
    question: "Which file-allocation method supports fast direct (random) access but suffers from external fragmentation and difficulty growing files?",
    options: ["Linked allocation", "Contiguous allocation", "Indexed allocation", "FAT"],
    answer: 1,
    explanation: "Contiguous allocation stores a file in consecutive blocks (start, length): block i is simply start + i, giving excellent sequential and random access. But free space fragments and files can't easily grow beyond their reserved extent. Modern file systems use extents (contiguous runs) to get most of the benefit.",
    optionExplanations: ["Linked allocation has slow random access but no external fragmentation.", "Correct.", "Indexed allocation avoids external fragmentation.", "FAT is a variant of linked allocation."]
  },
  {
    id: "os-fs-006", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "What's the main weakness of LINKED allocation (each block stores a pointer to the next)?",
    options: ["Random access is slow: reaching block i requires reading the i blocks before it; also a damaged pointer loses the rest of the file, and pointers consume space in each block", "External fragmentation", "Files can't grow", "It requires contiguous free space"],
    answer: 0,
    explanation: "Linked allocation has no external fragmentation and files grow easily, but it's essentially sequential-access only. FAT moves the pointers into a table (which can be cached in memory), making random access much faster.",
    optionExplanations: ["Correct.", "Any free block can be used, so there's no external fragmentation.", "Growing is easy: link another block.", "Blocks can be scattered."]
  },
  {
    id: "os-fs-007", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "How does the File Allocation Table (FAT) improve on plain linked allocation?",
    options: ["It makes files contiguous", "The next-block pointers are stored in a table at the start of the volume (one entry per block) that can be cached in memory, so following a file's chain to find block i needs no data-block reads", "It removes the need for directories", "It uses inodes"],
    answer: 1,
    explanation: "A directory entry stores the first block; FAT[block] gives the next block, with a special end-of-chain marker. FAT32 is still common on USB drives; it limits individual files to 4 GB − 1 byte.",
    optionExplanations: ["Blocks can still be scattered.", "Correct.", "Directories still exist.", "FAT has no inodes."]
  },
  {
    id: "os-fs-008", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "What's the largest single file you can store on a FAT32 file system?",
    options: ["2 GB", "4 GB − 1 byte", "16 TB", "Unlimited"],
    answer: 1,
    explanation: "FAT32 stores the file size in a 32-bit field, capping files at 2³² − 1 bytes. That's why large videos or disk images often fail to copy to FAT32 drives; exFAT or NTFS lift the limit.",
    optionExplanations: ["That's a FAT16-era limit.", "Correct.", "That's typical of ext4.", "There's a hard 32-bit limit."]
  },
  {
    id: "os-fs-009", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "In indexed allocation, what does each file have?",
    options: ["A pointer in every data block", "A single pointer to the last block", "A contiguous run of blocks", "An index block containing pointers to all of its data blocks, giving direct access without external fragmentation (at the cost of index-block overhead, especially for tiny files)"],
    answer: 3,
    explanation: "Large files need multiple index blocks: linked index blocks, multilevel indexes, or the combined scheme of Unix inodes (direct pointers plus single, double and triple indirect blocks).",
    optionExplanations: ["That's linked allocation.", "That's not a real scheme.", "That's contiguous allocation.", "Correct."]
  },
  {
    id: "os-fs-010", subject: "os", subtopic: "File Systems", difficulty: "hard", type: "numerical",
    question: "An inode has 10 direct pointers, 1 single-indirect and 1 double-indirect pointer. Blocks are 1 KB and pointers are 4 bytes. What is the maximum file size?",
    options: ["10 KB", "266 KB", "65,802 KB (≈ 64.3 MB)", "16 MB"],
    answer: 2,
    explanation: "Pointers per block = 1024 / 4 = 256. Direct: 10 blocks. Single indirect: 256 blocks. Double indirect: 256 × 256 = 65,536 blocks. Total = 10 + 256 + 65,536 = 65,802 blocks × 1 KB = 65,802 KB ≈ 64.3 MB.",
    optionExplanations: ["That's only the direct blocks.", "That omits the double-indirect level.", "Correct.", "Recompute: 65,802 KB."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-fs-011", subject: "os", subtopic: "File Systems", difficulty: "hard", type: "numerical",
    question: "ext2-style inode: 12 direct pointers, plus single, double and triple indirect; 4 KB blocks; 4-byte pointers. Approximately what's the maximum file size from the pointer structure?",
    options: ["48 KB", "About 4 GB", "About 4 TB", "About 16 EB"],
    answer: 2,
    explanation: "Pointers per block = 4096 / 4 = 1024. Blocks addressable: 12 + 1024 + 1024² + 1024³ ≈ 1.07 × 10⁹ blocks × 4 KB ≈ 4 TB (the triple-indirect level dominates). Other limits (32-bit block counts, ext4 extents) may apply in real systems.",
    optionExplanations: ["That's only the direct blocks.", "That's roughly the double-indirect contribution.", "Correct.", "That's the 64-bit address space."]
  },
  {
    id: "os-fs-012", subject: "os", subtopic: "File Systems", difficulty: "hard", type: "numerical",
    question: "With 4 KB blocks, 12 direct pointers and 4-byte pointers (inode already in memory, no caching of indirect blocks), how many disk block reads are needed to read the byte at file offset 100 KB?",
    options: ["2", "1", "3", "4"],
    answer: 0,
    explanation: "Block index = 100 KB / 4 KB = 25. Direct pointers cover blocks 0–11, so block 25 lies in the single-indirect range (blocks 12–1035). Reads: the single-indirect block (1) + the data block (1) = 2.",
    optionExplanations: ["Correct.", "Block 25 isn't covered by direct pointers.", "That would be the double-indirect range.", "That would be the triple-indirect range."]
  },
  {
    id: "os-fs-013", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "numerical",
    question: "A 1 TB disk uses 4 KB blocks and tracks free space with a bit vector (one bit per block). How large is the bitmap?",
    options: ["32 KB", "256 MB", "32 MB", "4 MB"],
    answer: 2,
    explanation: "Blocks = 2⁴⁰ / 2¹² = 2²⁸. One bit each → 2²⁸ bits = 2²⁵ bytes = 32 MB. Bit vectors make finding contiguous free blocks easy but must be cached in memory for speed.",
    optionExplanations: ["Off by a factor of 1024.", "That confuses bits with bytes: 2²⁸ bits is 256 Mbit = 32 MB.", "Correct.", "Off by a factor of 8."]
  },
  {
    id: "os-fs-014", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "Which free-space management techniques are commonly used?",
    options: ["Bit vector (bitmap), linked list of free blocks, grouping (a free block stores addresses of n other free blocks), and counting (store start + count for runs of free blocks)", "Only a sorted array", "Free space isn't tracked", "Free blocks are found by scanning all files"],
    answer: 0,
    explanation: "Each trades memory overhead against speed of finding (contiguous) free space. Modern file systems often use extent-based trees or bitmaps per block group.",
    optionExplanations: ["Correct.", "Several techniques exist.", "Tracking free space is essential.", "That would be impractically slow."]
  },
  {
    id: "os-fs-015", subject: "os", subtopic: "File Systems", difficulty: "easy", type: "numerical",
    question: "What permissions does `chmod 754 report.sh` set?",
    options: ["rwxr-xr--", "rwxrwxr--", "rw-r-xr--", "rwxr--r-x"],
    answer: 0,
    explanation: "Each octal digit encodes r = 4, w = 2, x = 1 for owner, group and others. 7 = 4+2+1 = rwx (owner), 5 = 4+1 = r-x (group), 4 = r-- (others).",
    optionExplanations: ["Correct.", "Group 5 is r-x, not rwx.", "Owner 7 includes execute.", "The group and others digits are swapped."],
    tags: ["interview-favourite"]
  },
  {
    id: "os-fs-016", subject: "os", subtopic: "File Systems", difficulty: "easy", type: "concept",
    question: "Which directory structure allows files and subdirectories to be organised hierarchically, with absolute and relative path names?",
    options: ["Single-level directory", "Two-level directory (one per user)", "Tree-structured directory", "Flat hash table"],
    answer: 2,
    explanation: "Single-level puts every file in one namespace (name clashes); two-level gives each user a separate directory; tree-structured directories allow arbitrary nesting. Acyclic-graph structures add sharing via links, and general graphs (with cycles) complicate traversal and deletion.",
    optionExplanations: ["All files share one directory.", "Only one level per user.", "Correct.", "Not a standard directory structure."]
  },
  {
    id: "os-fs-017", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "Why do Unix systems forbid hard links to directories (other than the automatic '.' and '..')?",
    options: ["Directories can't be linked at all", "Hard-linked directories could create cycles in the directory graph, breaking tree traversal tools (find, du), making '..' ambiguous and complicating reference counting for deletion", "Because directories are not files", "To save disk space"],
    answer: 1,
    explanation: "Keeping the directory graph acyclic (an acyclic graph when counting file hard links) keeps traversal and garbage collection simple. Symlinks to directories are allowed because tools can detect and skip them.",
    optionExplanations: ["Symlinks to directories are allowed.", "Correct.", "Directories are special files.", "Space isn't the concern."]
  },
  {
    id: "os-fs-018", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "What problem does a journaling file system (ext4, NTFS, XFS) solve?",
    options: ["It encrypts files", "It increases maximum file size", "It compresses files", "It writes intended metadata (and optionally data) changes to a log before applying them, so after a crash the file system can be quickly restored to a consistent state by replaying or discarding log entries instead of running a full fsck"],
    answer: 3,
    explanation: "A single operation like creating a file updates several structures (bitmap, inode, directory). A crash midway leaves them inconsistent. Journaling makes these updates atomic, like write-ahead logging in databases. Copy-on-write file systems (ZFS, Btrfs) achieve consistency differently.",
    optionExplanations: ["Encryption is separate.", "Size limits are unrelated.", "Compression is separate.", "Correct."]
  },
  {
    id: "os-fs-019", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "What is the Virtual File System (VFS) layer in Linux?",
    options: ["A file system stored in RAM", "An abstraction layer that defines common interfaces (inode, file, dentry, superblock operations) so system calls like open/read/write work uniformly across ext4, XFS, NFS, procfs and others", "A backup system", "A virtual disk"],
    answer: 1,
    explanation: "Each concrete file system plugs in its own implementations of the VFS operations. That's how one `cat` command can read a local file, a network file or a /proc pseudo-file.",
    optionExplanations: ["That's tmpfs, one VFS-backed file system.", "Correct.", "Not related to backups.", "A virtual disk is a block device, not the VFS."]
  },
  {
    id: "os-fs-020", subject: "os", subtopic: "File Systems", difficulty: "easy", type: "concept",
    question: "What does mounting a file system mean?",
    options: ["Formatting a disk", "Attaching a file system (e.g. a partition or USB drive) at a directory (the mount point) in the existing directory tree so its files become accessible under that path", "Copying files to a disk", "Checking a disk for errors"],
    answer: 1,
    explanation: "For example, `mount /dev/sdb1 /mnt/usb` makes the USB drive's root appear at /mnt/usb. /etc/fstab lists file systems mounted at boot. Unix uses a single directory tree, unlike drive letters on Windows.",
    optionExplanations: ["That's mkfs.", "Correct.", "Copying is unrelated.", "That's fsck."]
  },
  {
    id: "os-fs-021", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "When a process opens a file, which tables does the kernel use?",
    options: ["A per-process file-descriptor table pointing to entries in a system-wide open-file table (which holds the current offset and access mode) that in turn reference the in-memory inode", "Only the inode table", "A single global array of file names", "The page table"],
    answer: 0,
    explanation: "After fork(), parent and child share open-file-table entries, so they share the file offset. Two independent open() calls on the same file get separate entries with separate offsets.",
    optionExplanations: ["Correct.", "The file descriptor indirection is essential.", "Names aren't stored per open file this way.", "Page tables map memory."]
  },
  {
    id: "os-fs-022", subject: "os", subtopic: "File Systems", difficulty: "hard", type: "concept",
    question: "A parent opens a file, then forks. The child reads 100 bytes, and then the parent reads 50 bytes. From which offset does the parent's read start?",
    options: ["100", "0", "50", "It depends on scheduling"],
    answer: 0,
    explanation: "fork() duplicates the file DESCRIPTOR, but both descriptors point to the same open-file-table entry, which holds a single shared offset. After the child's read the offset is 100, so the parent reads bytes 100–149.",
    optionExplanations: ["Correct.", "The offset is shared, not copied.", "The offset was advanced by the child.", "The order is given: the child reads first."],
    tags: ["trap"]
  },
  {
    id: "os-fs-023", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "Which access method do most file APIs provide, and how is direct access done?",
    options: ["Only sequential access", "Sequential access (read the next bytes, advancing the offset) plus direct/random access by repositioning the offset with lseek()/fseek() before reading or writing", "Only indexed access", "Access by record number only"],
    answer: 1,
    explanation: "Files are byte streams in Unix. Indexed access (via a separate index, like ISAM) is typically implemented by applications/databases on top of direct access.",
    optionExplanations: ["Random access is available.", "Correct.", "Indexing is built by applications.", "Unix files are untyped byte streams."]
  },
  {
    id: "os-fs-024", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "Why can a write() return successfully, yet the data be lost if the machine loses power a second later?",
    options: ["write() is broken", "Power loss doesn't affect files", "Disks are always unreliable", "write() usually copies data into the kernel's page cache (buffer cache) and returns; the data reaches disk later. Use fsync()/fdatasync() (or O_SYNC) to force it to stable storage"],
    answer: 3,
    explanation: "Write-back caching makes I/O fast but means the most recent writes may be in memory only. Databases call fsync on their write-ahead log at commit to guarantee durability.",
    optionExplanations: ["This is intended behaviour.", "Unflushed data is lost.", "The issue is caching, not disk reliability.", "Correct."]
  },
  {
    id: "os-fs-025", subject: "os", subtopic: "File Systems", difficulty: "hard", type: "numerical",
    question: "A file uses contiguous allocation starting at block 200 with length 50. Under linked allocation (each block holds a next pointer), reaching block 30 of the file would require how many block reads, compared with contiguous allocation (start block known)?",
    options: ["Contiguous 1; linked 31", "Contiguous 30; linked 1", "Both 1", "Contiguous 1; linked 2"],
    answer: 0,
    explanation: "Contiguous: compute 200 + 30 = block 230 and read it directly (1 read). Linked: start at the first block and follow pointers through blocks 0, 1, …, 29 to reach block 30 → 31 reads. That's why linked allocation is unsuitable for random access.",
    optionExplanations: ["Correct.", "Reversed.", "Linked allocation must traverse the chain.", "Each pointer is inside a data block that must be read."]
  },
  {
    id: "os-fs-026", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "What is the link count of a newly created empty DIRECTORY /home/u/docs in a traditional Unix file system?",
    options: ["0", "1", "2", "3"],
    answer: 2,
    explanation: "Two names refer to it: its entry 'docs' in the parent directory, and its own '.' entry. Each subdirectory added later increases the count by 1 because of that subdirectory's '..' entry.",
    optionExplanations: ["The directory is referenced by names.", "Its '.' entry also counts.", "Correct.", "There are no subdirectories yet."]
  },
  {
    id: "os-fs-027", subject: "os", subtopic: "File Systems", difficulty: "hard", type: "concept",
    question: "A process has a log file open and someone runs `rm log.txt`. The process keeps writing. What happens to the disk space?",
    options: ["It's freed immediately", "The name disappears, but the inode and data blocks remain allocated (link count 0, but still open) until the process closes the file; `df` won't show the space as free until then", "rm fails because the file is open", "The process crashes"],
    answer: 1,
    explanation: "A file is deleted only when both its link count and its open count drop to zero. This is a classic cause of 'disk full but du shows nothing': find such files with `lsof | grep deleted` and restart or signal the process to reopen logs.",
    optionExplanations: ["The open file keeps the inode alive.", "Correct.", "Unix allows unlinking open files.", "The process can continue writing normally."],
    tags: ["trap"]
  },
  {
    id: "os-fs-028", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "What does fsck do, and why do journaling file systems need it less?",
    options: ["It defragments disks", "It checks permissions", "It formats disks", "It scans file-system metadata (inodes, bitmaps, directories) after an unclean shutdown to find and fix inconsistencies; journaling replays a small log instead, avoiding full scans that can take hours on large disks"],
    answer: 3,
    explanation: "Without a journal, consistency must be reconstructed by examining the whole volume. With a journal, only recently logged operations need attention, so recovery takes seconds.",
    optionExplanations: ["That's a defragmenter.", "Permissions aren't its focus.", "That's mkfs.", "Correct."]
  },
  {
    id: "os-fs-029", subject: "os", subtopic: "File Systems", difficulty: "easy", type: "concept",
    question: "Which statement about common file systems is correct?",
    options: ["FAT32 supports journaling", "NTFS is used only on USB drives", "ext4 is the default on many Linux distributions; NTFS is Windows' main file system; XFS suits large files; Btrfs/ZFS add copy-on-write, snapshots and checksums", "ext4 is a Windows file system"],
    answer: 2,
    explanation: "Choice depends on features: journaling (ext4, NTFS, XFS), snapshots/checksums (Btrfs, ZFS), compatibility (FAT32/exFAT for removable media).",
    optionExplanations: ["FAT32 has no journal.", "NTFS is used on Windows system drives.", "Correct.", "ext4 is a Linux file system."]
  },
  {
    id: "os-fs-030", subject: "os", subtopic: "File Systems", difficulty: "medium", type: "concept",
    question: "In an acyclic-graph directory structure with shared files, what problem arises when deleting a shared file, and how do hard links handle it?",
    options: ["No problem arises", "Shared files can't be deleted", "Deleting removes all paths automatically", "Deleting via one path could leave other directory entries pointing to freed data (dangling references); hard links solve it with reference counting — the file is removed only when its last link is deleted"],
    answer: 3,
    explanation: "Symbolic links take the other approach: deleting the target leaves dangling symlinks that simply fail to resolve. General graphs with cycles need garbage collection, since reference counts never reach zero for cycles.",
    optionExplanations: ["Dangling references are a real issue.", "They can be deleted; the last link frees them.", "Other links aren't removed automatically.", "Correct."]
  }
);
