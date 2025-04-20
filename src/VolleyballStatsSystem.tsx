import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  Grid,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/MenuOutlined";

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

const createInitialStats = (): PlayerStats[] => [];

const columns: (keyof PlayerStats)[] = [
  "player", "number", "position", "K", "E", "TA", "PCT",
  "A", "SA", "SE", "RE", "D", "BS", "BA", "BE", "BHE"
];

const columnDescriptions: Record<string, string> = {
  player: "Player Name",
  number: "Player Number",
  position: "Player Position",
  K: "Kills",
  E: "Errors",
  TA: "Total Attacks",
  PCT: "Hitting Percentage",
  A: "Assists",
  SA: "Service Aces",
  SE: "Service Errors",
  RE: "Reception Errors",
  D: "Digs",
  BS: "Block Solo",
  BA: "Block Assist",
  BE: "Block Errors",
  BHE: "Ball Handling Errors",
};

export default function VolleyballStatTracker() {
  const [game, setGame] = useState("");
  const [team1, setTeam1] = useState("Team 1");
  const [team2, setTeam2] = useState("Team 2");
  const [team1Stats, setTeam1Stats] = useState<PlayerStats[]>(createInitialStats());
  const [team2Stats, setTeam2Stats] = useState<PlayerStats[]>(createInitialStats());
  const [drawerOpen, setDrawerOpen] = useState(false);

  const addPlayer = (team: "team1" | "team2") => {
    const newPlayer: PlayerStats = {
      id: Date.now(),
      player: "",
      number: "",
      position: "",
      K: 0,
      E: 0,
      TA: 0,
      PCT: "",
      A: 0,
      SA: 0,
      SE: 0,
      RE: 0,
      D: 0,
      BS: 0,
      BA: 0,
      BE: 0,
      BHE: 0,
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
    const data = team === "team1" ? [...team1Stats] : [...team2Stats];
    const updated = { ...data[index], [field]: field === "PCT" || ["player", "number", "position"].includes(field) ? value : parseInt(value) || 0 };

    if (
      typeof updated.K === "number" &&
      typeof updated.E === "number"
    ) {
      updated.TA = updated.K + updated.E;
      updated.PCT = updated.TA !== 0 ? ((updated.K - updated.E) / updated.TA).toFixed(3) : "";
    }

    data[index] = updated;
    team === "team1" ? setTeam1Stats(data) : setTeam2Stats(data);
  };

  const exportCSV = () => {
    const formatRow = (row: PlayerStats) => columns.map(col => row[col]).join(",");
    const csvLines = [
      `Game: ${game}`,
      `${team1} Stats:`,
      columns.join(","),
      ...team1Stats.map(formatRow),
      "",
      `${team2} Stats:`,
      columns.join(","),
      ...team2Stats.map(formatRow)
    ];
    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const fileName = `${game || 'Game'}_${team1}_${team2}`.replace(/\s+/g, '_') + '.csv';
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTable = (team: "team1" | "team2", stats: PlayerStats[]) => {
    const totals: Record<string, number | string> = {};
    columns.forEach((col) => {
      if (["player", "number", "position", "PCT"].includes(col)) {
        totals[col] = "";
      } else {
        totals[col] = stats.reduce((sum, row) => sum + (typeof row[col] === 'number' ? (row[col] as number) : 0), 0);
      }
    });
    return (
      <>
        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 300, overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col} title={columnDescriptions[col]}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.map((row, rowIndex) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={col}>
                      <TextField
                        value={row[col]}
                        type={typeof row[col] === "number" && col !== "PCT" ? "number" : "text"}
                        onChange={(e) => (col === "PCT" || col === "TA") ? undefined : handleChange(team, rowIndex, col, e.target.value)}
                        variant="standard"
                        inputProps={{ min: 0, readOnly: col === "PCT" || col === "TA" }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            <tfoot>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col} sx={{ position: 'sticky', bottom: 0, backgroundColor: 'white', fontWeight: 'bold' }}>
                    {totals[col]}
                  </TableCell>
                ))}
              </TableRow>
            </tfoot>
          </Table>
        </TableContainer>
        <div style={{ display: 'flex', gap: '8px', marginTop: 8 }}>
          <button onClick={() => addPlayer(team)}>Add Player</button>
          <button onClick={() => removePlayer(team)}>Remove Player</button>
        </div>
      </>
    );
  };

  const serviceAceMismatch = team1Stats.reduce((sum, p) => sum + p.SA, 0) !== team2Stats.reduce((sum, p) => sum + p.RE, 0) ||
    team2Stats.reduce((sum, p) => sum + p.SA, 0) !== team1Stats.reduce((sum, p) => sum + p.RE, 0);

  const digMismatch = team1Stats.reduce((sum, p) => sum + p.D, 0) > team2Stats.reduce((sum, p) => sum + p.TA, 0) ||
    team2Stats.reduce((sum, p) => sum + p.D, 0) > team1Stats.reduce((sum, p) => sum + p.TA, 0);

  return (
    <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Volleyball Stats
          </Typography>
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

      <div style={{ overflowY: "auto", flexGrow: 1, padding: "16px" }}>
        <Grid container spacing={2}>
          <Grid>
            <TextField label="Game" value={game} onChange={(e) => setGame(e.target.value)} fullWidth />
          </Grid>
          <Grid>
            <TextField label="Team 1" value={team1} onChange={(e) => setTeam1(e.target.value)} fullWidth />
          </Grid>
          <Grid>
            <TextField label="Team 2" value={team2} onChange={(e) => setTeam2(e.target.value)} fullWidth />
          </Grid>
        </Grid>

        {(serviceAceMismatch || digMismatch) && (
          <Typography color="error" sx={{ mt: 2 }}>
            ⚠️ Warning:
            {serviceAceMismatch && " Service Aces ≠ Opponent Reception Errors."}
            {digMismatch && " Digs exceed opponent's total attacks."}
          </Typography>
        )}

        <button onClick={exportCSV} style={{ marginTop: 24, marginBottom: 16 }}>
          Export to CSV
        </button>

        <Typography variant="h6" sx={{ mt: 2 }}>{team1} Stats</Typography>
        {renderTable("team1", team1Stats)}

        <Typography variant="h6" sx={{ mt: 4 }}>{team2} Stats</Typography>
        {renderTable("team2", team2Stats)}
      </div>
    </div>
  );
}
