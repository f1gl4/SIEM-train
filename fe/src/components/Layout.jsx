import { Outlet, Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function Layout() {
  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/malware">Malware</Button>
          <Button color="inherit" component={Link} to="/stats">Stats</Button>
          <Button color="inherit" component={Link} to="/siem">SIEM</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <Outlet />
      </Box>
    </>
  );
}
