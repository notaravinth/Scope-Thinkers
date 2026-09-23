import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PublicRounded, SearchRounded } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";

const API = "https://api.restcountries.com/countries/v5";

const formatPopulation = (value) =>
  value >= 1e9
    ? `${(value / 1e9).toFixed(2)}B`
    : value >= 1e6
      ? `${(value / 1e6).toFixed(2)}M`
      : value >= 1e3
        ? `${(value / 1e3).toFixed(1)}K`
        : value.toLocaleString();

function App() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");

  // Fetch all countries from REST Countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const allCountries = [];
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
          const response = await fetch(`${API}?limit=100&offset=${offset}`, {
            headers: {
              Authorization: `Bearer ${
                import.meta.env.VITE_REST_COUNTRIES_API_KEY
              }`,
            },
          });

          if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
          }

          const result = await response.json();

          allCountries.push(...result.data.objects);

          hasMore = result.data.meta.more;
          offset += 100;
        }

        setCountries(allCountries);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Get unique regions
  const regions = useMemo(
    () =>
      [
        ...new Set(countries.map((country) => country.region).filter(Boolean)),
      ].sort(),
    [countries],
  );

  // Transform API data into DataGrid rows
  const rows = useMemo(
    () =>
      countries.map((country, index) => {
        const alpha2 = country.codes?.alpha_2?.toLowerCase();

        return {
          id: country.codes?.alpha_3 || country.codes?.alpha_2 || index,

          name: country.names?.common || "Unknown",

          capital: country.capitals?.[0]?.name || "No capital",

          region: country.region || "Unknown",

          population: country.population || 0,

          code: country.codes?.alpha_2 || "---",

          flagUrl: alpha2
            ? `https://flags.restcountries.com/v5/w320/${alpha2}.png`
            : null,
        };
      }),
    [countries],
  );

  // Search + region filtering
  const filteredRows = useMemo(() => {
    const query = search.toLowerCase().trim();

    return rows.filter((row) => {
      const matchesSearch =
        !query ||
        row.name.toLowerCase().includes(query) ||
        row.capital.toLowerCase().includes(query) ||
        row.code.toLowerCase().includes(query);

      const matchesRegion = region === "All" || row.region === region;

      return matchesSearch && matchesRegion;
    });
  }, [rows, search, region]);

  // Save edited row back into React state
  const processRowUpdate = (newRow) => {
    setCountries((currentCountries) =>
      currentCountries.map((country, index) => {
        const id = country.codes?.alpha_3 || country.codes?.alpha_2 || index;

        if (id !== newRow.id) {
          return country;
        }

        return {
          ...country,

          names: {
            ...country.names,
            common: newRow.name,
          },

          capitals: newRow.capital
            ? [
                {
                  ...(country.capitals?.[0] || {}),
                  name: newRow.capital,
                },
              ]
            : [],

          region: newRow.region,

          population: Number(newRow.population),
        };
      }),
    );

    return newRow;
  };

  const columns = [
    {
      field: "name",
      headerName: "COUNTRY",
      flex: 1.3,
      minWidth: 250,
      editable: true,

      renderCell: ({ row, value }) => (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ height: "100%" }}
        >
          {/* Flag */}
          <Box
            sx={{
              width: 44,
              height: 32,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              boxShadow: "0 2px 6px rgba(15,23,42,0.05)",
            }}
          >
            {row.flagUrl ? (
              <img
                src={row.flagUrl}
                alt={`${value} flag`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <span style={{ fontSize: "18px" }}>🌐</span>
            )}
          </Box>

          {/* Country name + code */}
          <Box>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              {value}
            </Typography>

            <Typography
              sx={{
                marginTop: "2px",
                fontSize: "10px",
                fontWeight: 650,
                letterSpacing: "0.1em",
                color: "#94a3b8",
              }}
            >
              {row.code}
            </Typography>
          </Box>
        </Stack>
      ),
    },

    {
      field: "capital",
      headerName: "CAPITAL",
      flex: 1,
      minWidth: 190,
      editable: true,

      renderCell: ({ value }) => (
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#64748b",
          }}
        >
          {value}
        </Typography>
      ),
    },

    {
      field: "region",
      headerName: "REGION",
      flex: 0.8,
      minWidth: 160,
      editable: true,

      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          sx={{
            height: 28,
            borderRadius: "999px",
            backgroundColor: "#f0f9ff",
            border: "1px solid #d5f0fb",
            color: "#0891b2",
            fontWeight: 600,
            fontSize: 11,
          }}
        />
      ),
    },

    {
      field: "population",
      headerName: "POPULATION",
      flex: 0.8,
      minWidth: 160,
      type: "number",
      editable: true,

      renderCell: ({ value }) => (
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#334155",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatPopulation(value)}
        </Typography>
      ),
    },
  ];

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <section className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <p className="text-xs font-bold tracking-[0.18em] text-red-500">
            SYSTEM ERROR
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            Unable to load countries
          </h1>

          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(186,230,253,0.45),transparent_25%),radial-gradient(circle_at_90%_0%,rgba(224,231,255,0.55),transparent_28%),#f5f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* HERO */}
        <section className="relative mb-5 overflow-hidden rounded-[30px] border border-white/80 bg-white/80 p-7 shadow-xl shadow-slate-200/40 backdrop-blur-xl sm:p-9">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-100/40 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_14px_rgba(6,182,212,0.5)]" />

              <span className="text-[10px] font-extrabold tracking-[0.2em] text-cyan-600">
                GLOBAL DATA SYSTEM
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.9] tracking-[-0.06em] text-slate-950">
                  COUNTRY{" "}
                  <span className="bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
                    EXPLORER
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                  Explore and edit global geographic and demographic data
                  through an interactive data interface.
                </p>
              </div>

              <div className="flex w-fit items-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3">
                <PublicRounded
                  sx={{
                    color: "#0891b2",
                    fontSize: 19,
                  }}
                />

                <div>
                  <p className="text-[9px] font-bold tracking-[0.12em] text-slate-400">
                    RECORDS
                  </p>

                  <p className="text-base font-extrabold text-cyan-600">
                    {loading ? "..." : countries.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TABLE PANEL */}
        <section className="overflow-hidden rounded-[30px] border border-white bg-white shadow-xl shadow-slate-200/50">
          {/* TOOLBAR */}
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 sm:p-5 md:flex-row">
            <TextField
              fullWidth
              size="small"
              placeholder="Search country, capital or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded
                      sx={{
                        color: "#94a3b8",
                        fontSize: 19,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 46,
                  borderRadius: "16px",
                  backgroundColor: "#f8fafc",
                },

                "& fieldset": {
                  borderColor: "#e8edf3",
                },

                "&:hover fieldset": {
                  borderColor: "#cbd5e1",
                },

                "& .MuiOutlinedInput-root.Mui-focused": {
                  boxShadow: "0 0 0 4px rgba(6,182,212,0.06)",
                },

                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: "#7dd3fc",
                },
              }}
            />

            <TextField
              select
              size="small"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              sx={{
                minWidth: {
                  xs: "100%",
                  md: 190,
                },

                "& .MuiOutlinedInput-root": {
                  height: 46,
                  borderRadius: "16px",
                  backgroundColor: "#f8fafc",
                },

                "& fieldset": {
                  borderColor: "#e8edf3",
                },

                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: "#7dd3fc",
                },
              }}
            >
              <MenuItem value="All">All regions</MenuItem>

              {regions.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </div>

          {/* RESULT BAR */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              <span className="text-[10px] font-bold tracking-[0.1em] text-slate-400">
                {loading
                  ? "SYNCHRONIZING DATA"
                  : `${filteredRows.length} RECORDS`}
              </span>
            </div>

            {!loading && (
              <span className="text-[10px] font-medium text-slate-400">
                Double-click a cell to edit
              </span>
            )}
          </div>

          {/* DATA GRID */}
          <div className="h-[650px] w-full">
            <DataGrid
              rows={filteredRows}
              columns={columns}
              loading={loading}
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={(err) =>
                console.error("Update failed:", err)
              }
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: {
                    page: 0,
                    pageSize: 10,
                  },
                },
              }}
              disableRowSelectionOnClick
              disableColumnResize
              showCellVerticalBorder={false}
              showColumnVerticalBorder={false}
              rowHeight={68}
              columnHeaderHeight={54}
              sx={{
                border: 0,

                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#fbfcfe",
                  borderBottom: "1px solid #eef2f7",
                },

                "& .MuiDataGrid-columnHeader": {
                  outline: "none",
                },

                "& .MuiDataGrid-columnHeaderTitle": {
                  color: "#94a3b8",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: ".12em",
                },

                "& .MuiDataGrid-columnSeparator": {
                  display: "none",
                },

                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #f2f5f8",
                  outline: "none",
                },

                "& .MuiDataGrid-cell:focus-within": {
                  outline: "none",
                },

                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f8fbff",
                },

                "& .MuiDataGrid-cell--editing": {
                  backgroundColor: "#f4fbff",
                  boxShadow: "inset 0 0 0 1px #bae6fd",
                },

                "& .MuiDataGrid-footerContainer": {
                  borderTop: "1px solid #eef2f7",
                  backgroundColor: "#fff",
                },

                "& .MuiTablePagination-root": {
                  color: "#64748b",
                },

                "& .MuiIconButton-root": {
                  color: "#94a3b8",
                  borderRadius: "50%",
                },

                "& .MuiIconButton-root:hover": {
                  color: "#0891b2",
                  backgroundColor: "#f1f5f9",
                },

                "& ::-webkit-scrollbar": {
                  width: 7,
                  height: 7,
                },

                "& ::-webkit-scrollbar-track": {
                  background: "transparent",
                },

                "& ::-webkit-scrollbar-thumb": {
                  background: "#dbe4ee",
                  borderRadius: 999,
                },
              }}
            />
          </div>
        </section>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-2 py-4">
          <span className="text-[9px] font-bold tracking-[0.12em] text-slate-400">
            REST COUNTRIES · V5
          </span>

          <span className="text-[9px] font-bold tracking-[0.12em] text-slate-400">
            DATA GRID
          </span>
        </div>
      </div>
    </main>
  );
}

export default App;
