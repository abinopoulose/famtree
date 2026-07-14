# FamTree

A modern, dynamic Family Tree visualizer built with React, TypeScript, and Vite. 

**Experience it live:** [famtree.abino.in](https://famtree.abino.in)

The standout feature of FamTree is its ability to **magically construct a beautiful, interactive family tree from a simple CSV file**. You don't need to write complex graph data structures or JSON—just fill out a spreadsheet.

## How it Works: The CSV Magic

FamTree uses a simple CSV structure (`public/data.csv`) to map out your entire lineage. By simply defining who someone's parent or spouse is via their email address, the application's underlying graph algorithms automatically calculate generational depth, relationships, and layout positioning.

### CSV Structure

Your `data.csv` just needs the following columns:

| Column | Description | Example |
| :--- | :--- | :--- |
| **Name** | Full name of the person | `George Thomas` |
| **Gender** | `Male` or `Female` | `Male` |
| **Phone** | Contact number | `9000000001` |
| **Email** | Unique identifier for the person | `george.thomas@example.com` |
| **Image** | Path to the person's avatar | `public/men/1.jpg` |
| **Parent_Email** | Email of the person's parent (`NULL` if root) | `NULL` |
| **Spouse_Email** | Email of the person's spouse (`NULL` if unmarried) | `mary.thomas@example.com` |

### The "Magic" Explained

1. **Flat to Graph:** The application fetches the CSV and parses it into a flat list of people.
2. **Relationship Binding:** It dynamically links individuals by matching their unique `Email` against the `Parent_Email` and `Spouse_Email` fields.
3. **Generational Layout Engine:** Using custom graph traversal algorithms, the engine calculates the "depth" of each node to group generations into strict, visually distinct horizontal rows.
4. **Spouse Consolidation:** Husbands and wives are intelligently paired and visually grouped within the same layout component, ensuring a clean and organized tree instead of chaotic branching.
5. **Interactive Exploration:** Once rendered, you can click on anyone in the tree to isolate their specific lineage, expand their immediate family, or view their profile details.
