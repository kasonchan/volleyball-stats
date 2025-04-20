import { useEffect, useState } from "react";
import {
  AppBar, Toolbar, IconButton, Typography, TextField, Grid,
  Drawer, List, ListItem, ListItemText, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Box, Tabs, Tab
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface PlayerStats {
  id: number;
  player: string;
  number: string;
  position: string;
  K: number;
  E: number;
  TA: number;
  PCT: string;
  A: number;
  SA: number;
  SE: number;
  RE: number;
  D: number;
  BS: number;
  BA: number;
  BE: number;
  BHE: number;
}

type SavedSet = {
  name: string;
  team1Name: string;
  team2Name: string;
  team1: PlayerStats[];
  team2: PlayerStats[];
};

const columns: (keyof PlayerStats)[] = [
  "player", "number", "position", "K", "E", "TA", "PCT",
  "A", "SA", "SE", "RE", "D", "BS", "BA", "BE", "BHE"
];

const columnDescriptions: Record<string, string> = {
  player: "Player Name", number: "Player Number", position: "Player Position (OH: Outside Hitter, S: Setter, MB: Middle Blocker, OP: Opposite, L: Libero, DS: Defensive Specialist)",
  K: "Kills", E: "Errors", TA: "Total Attacks", PCT: "Hitting Percentage",
  A: "Assists", SA: "Service Aces", SE: "Service Errors", RE: "Reception Errors",
  D: "Digs", BS: "Block Solo", BA: "Block Assist", BE: "Block Errors", BHE: "Ball Handling Errors"
};

export default function VolleyballStatTracker() {
  const [game, setGame] = useState("");
  const [team1, setTeam1] = useState("Team 1");
  const [team2, setTeam2] = useState("Team 2");
  const [setName, setSetName] = useState("Set 1");
  const [team1Stats, setTeam1Stats] = useState<PlayerStats[]>([]);
  const [team2Stats, setTeam2Stats] = useState<PlayerStats[]>([]);
  const [sets, setSets] = useState<SavedSet[]>([]);
  const [setTabIndex, setSetTabIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("volleyball_sets");
    if (stored) {
      try {
        setSets(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored sets", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("volleyball_sets", JSON.stringify(sets));
  }, [sets]);

  const addPlayer = (team: "team1" | "team2") => {
    const newPlayer: PlayerStats = {
      id: Date.now(), player: "", number: "", position: "",
      K: 0, E: 0, TA: 0, PCT: "", A: 0, SA: 0, SE: 0, RE: 0,
      D: 0, BS: 0, BA: 0, BE: 0, BHE: 0
    };
    team === "team1"
      ? setTeam1Stats((prev) => [...prev, newPlayer])
      : setTeam2Stats((prev) => [...prev, newPlayer]);
  };

  const removePlayer = (team: "team1" | "team2") => {
    team === "team1"
      ? setTeam1Stats((prev) => prev.slice(0, -1))
      : setTeam2Stats((prev) => prev.slice(0, -1));
  };

  const handleChange = (
    team: "team1" | "team2",
    index: number,
    field: keyof PlayerStats,
    value: string
  ) => {
    const stats = team === "team1" ? [...team1Stats] : [...team2Stats];
    const updated = {
      ...stats[index],
      [field]: ["player", "number", "position", "PCT"].includes(field)
        ? value
        : parseInt(value) || 0,
    };

    if (typeof updated.K === "number" && typeof updated.E === "number") {
      updated.TA = updated.K + updated.E;
      updated.PCT = updated.TA ? ((updated.K - updated.E) / updated.TA).toFixed(3) : "";
    }

    stats[index] = updated;
    team === "team1" ? setTeam1Stats(stats) : setTeam2Stats(stats);
  };

  const renderTable = (team: "team1" | "team2", stats: PlayerStats[]) => {
    const totals: Record<string, number | string> = {};
    columns.forEach((col) => {
      totals[col] = ["player", "number", "position", "PCT"].includes(col)
        ? ""
        : stats.reduce((sum, row) => sum + (typeof row[col] === "number" ? row[col] : 0), 0);
    });

    return (
      <>
        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 300 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col} title={columnDescriptions[col]}>
                    {col === "player" ? "Player" :
                      col === "number" ? "Number" :
                        col === "position" ? "Position" : col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.map((row, i) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={col}>
                      {col === "position" ? (
                        <TextField
                          select
                          value={row[col]}
                          onChange={(e) => handleChange(team, i, col, e.target.value)}
                          variant="standard"
                          SelectProps={{ native: true }}
                        >
                          <option value="">--</option>
                          <option value="OH">OH</option>
                          <option value="S">S</option>
                          <option value="MB">MB</option>
                          <option value="OP">OP</option>
                          <option value="L">L</option>
                          <option value="DS">DS</option>
                        </TextField>
                      ) : (
                        <TextField
                          value={row[col]}
                          type={typeof row[col] === "number" && col !== "PCT" ? "number" : "text"}
                          onChange={(e) =>
                            ["PCT", "TA"].includes(col)
                              ? undefined
                              : handleChange(team, i, col, e.target.value)
                          }
                          variant="standard"
                          inputProps={{ min: 0, readOnly: col === "PCT" || col === "TA" }}
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            <tfoot>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col} sx={{ fontWeight: 'bold', position: 'sticky', bottom: 0, backgroundColor: 'white' }}>
                    {totals[col]}
                  </TableCell>
                ))}
              </TableRow>
            </tfoot>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <button onClick={() => addPlayer(team)}>Add Player</button>
          <button onClick={() => removePlayer(team)}>Remove Player</button>
        </Box>
      </>
    );
  };

  const exportSingleSetCSV = (set: SavedSet) => {
    const formatRow = (row: PlayerStats) => columns.map(col => row[col]).join(",");
    const lines = [
      `${set.name}`,
      `${set.team1Name} Stats:`,
      columns.join(","),
      ...set.team1.map(formatRow),
      "",
      `${set.team2Name} Stats:`,
      columns.join(","),
      ...set.team2.map(formatRow),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const fileName = `${game}_${set.name}_${set.team1Name}_${set.team2Name}`.replace(/\s+/g, "_") + ".csv";
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllSetsCSV = () => {
    const formatRow = (row: PlayerStats) => columns.map(col => row[col]).join(",");
    const lines: string[] = [];

    sets.forEach((set, i) => {
      lines.push(`Set ${i + 1}: ${set.name}`);
      lines.push(`${set.team1Name} Stats:`);
      lines.push(columns.join(","));
      lines.push(...set.team1.map(formatRow));
      lines.push("");
      lines.push(`${set.team2Name} Stats:`);
      lines.push(columns.join(","));
      lines.push(...set.team2.map(formatRow));
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const fileName = `${game || 'All_Sets'}`.replace(/\s+/g, "_") + ".csv";
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllSetsAsJSON = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      game,
      sets,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fileName = `${game || "Volleyball"}_All_Sets.json`.replace(/\s+/g, "_");
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importAllSetsFromJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (!Array.isArray(data.sets)) {
          throw new Error("Invalid format: missing 'sets' array.");
        }

        const shouldMerge = confirm("Merge imported sets with current sets?\nPress Cancel to overwrite.");

        if (shouldMerge) {
          setSets(prev => [...prev, ...data.sets]);
        } else {
          setSets(data.sets);
          setGame(data.game || "");
        }

        setSetTabIndex(0);
      } catch (err) {
        alert("Error importing JSON: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Volleyball Stat Tracker</Typography>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 250 }}>
          <ListItem><Typography variant="h6">Column Guide</Typography></ListItem>
          {columns.map((field) => (
            <ListItem key={field}>
              <ListItemText primary={`${field}: ${columnDescriptions[field]}`} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box sx={{ overflowY: "auto", flexGrow: 1, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Game" value={game} onChange={e => setGame(e.target.value)} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <button onClick={() => {
            const newSet: SavedSet = {
              name: setName,
              team1Name: team1,
              team2Name: team2,
              team1: [...team1Stats],
              team2: [...team2Stats],
            };
            setSets(prev => [...prev, newSet]);

            const match = setName.match(/^Set (\d+)$/);
            const nextNum = match ? parseInt(match[1]) + 1 : sets.length + 2;
            setSetName(`Set ${nextNum}`);
          }}>
            Save as New Set
          </button>

          <button onClick={exportAllSetsCSV}>
            Export All Sets to CSV
          </button>

          <button onClick={exportAllSetsAsJSON}>
            Export All Sets as JSON
          </button>

          <label style={{ cursor: "pointer" }}>
            <span style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: 4,
              display: "inline-block",
              backgroundColor: "#f5f5f5"
            }}>
              Import Sets from JSON
            </span>
            <input
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importAllSetsFromJSON(file);
                e.target.value = ""; // Reset for next upload
              }}
            />
          </label>
        </Box>


        <Typography variant="h6" sx={{ mt: 5 }}>Match Sets</Typography>
        <Tabs value={setTabIndex} onChange={(e, i) => setSetTabIndex(i)} sx={{ mb: 2 }}>
          <Tab label="Current" />
          {sets.map((set, i) => (
            <Tab
              key={i + 1}
              label={`${set.name}: ${set.team1Name} vs ${set.team2Name}`}
            />
          ))}
          <Tab label="Aggregate" />
        </Tabs>

        {setTabIndex === sets.length + 1 && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>All Sets Combined</Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Set</TableCell>
                    {columns.map((col) => (
                      <TableCell key={col} title={columnDescriptions[col]}>
                        {col === "player" ? "Player" :
                          col === "number" ? "Number" :
                            col === "position" ? "Position" : col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sets.flatMap((set, setIndex) =>
                    [...set.team1, ...set.team2].map((row, i) => (
                      <TableRow key={row.id + '-' + setIndex}>
                        <TableCell>{set.name}</TableCell>
                        {columns.map((col) => (
                          <TableCell key={col}>{row[col]}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {setTabIndex === 0 && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Set Name"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Team 1" value={team1} onChange={(e) => setTeam1(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Team 2" value={team2} onChange={(e) => setTeam2(e.target.value)} />
              </Grid>
            </Grid>

            <Typography variant="h6">{team1} Stats</Typography>
            {renderTable("team1", team1Stats)}

            <Typography variant="h6" sx={{ mt: 4 }}>{team2} Stats</Typography>
            {renderTable("team2", team2Stats)}
          </>
        )}

        {setTabIndex > 0 && sets[setTabIndex - 1] && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Rename Set"
              value={sets[setTabIndex - 1].name}
              onChange={(e) => {
                const updated = [...sets];
                updated[setTabIndex - 1].name = e.target.value;
                setSets(updated);
              }}
              sx={{ maxWidth: 300, mb: 2 }}
              fullWidth
            />
            <TextField
              label="Team 1 Name"
              value={sets[setTabIndex - 1].team1Name}
              onChange={(e) => {
                const updated = [...sets];
                updated[setTabIndex - 1].team1Name = e.target.value;
                setSets(updated);
              }}
              sx={{ mb: 1, mr: 2 }}
            />
            <TextField
              label="Team 2 Name"
              value={sets[setTabIndex - 1].team2Name}
              onChange={(e) => {
                const updated = [...sets];
                updated[setTabIndex - 1].team2Name = e.target.value;
                setSets(updated);
              }}
              sx={{ mb: 2 }}
            />
            <br />
            <button
              onClick={() => {
                const updated = [...sets];
                updated.splice(setTabIndex - 1, 1);
                setSets(updated);
                setSetTabIndex(0);
              }}
              style={{ marginRight: 12 }}
            >
              Delete This Set
            </button>
            <button onClick={() => exportSingleSetCSV(sets[setTabIndex - 1])}>
              Export Set to CSV
            </button>

            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 3 }}>
              {sets[setTabIndex - 1].team1Name} Stats
            </Typography>
            {renderTable("team1", sets[setTabIndex - 1].team1)}

            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 3 }}>
              {sets[setTabIndex - 1].team2Name} Stats
            </Typography>
            {renderTable("team2", sets[setTabIndex - 1].team2)}
          </Box>
        )}
      </Box>
    </div>
  );
}
