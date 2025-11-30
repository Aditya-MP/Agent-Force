import React, { useState, useEffect } from 'react';
import { Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

async function fetchAnalytics() {
  const res = await fetch('http://localhost:3001/api/admin/analytics');
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json();
}

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    fetchAnalytics().then(setData).catch(console.error);
  }, []);

  if (!data) return <div>Loading analytics...</div>;

  const { totalQueries, balance, staking, txHelp, other } = data;

  const pct = (x: number) =>
    totalQueries ? ((x / totalQueries) * 100).toFixed(1) + '%' : '0%';

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h5" gutterBottom>
        📊 Agent Forces – Admin Analytics
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary={`Total queries: ${totalQueries}`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Balance questions: ${balance} (${pct(balance)})`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Staking/pool questions: ${staking} (${pct(staking)})`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Transaction help questions: ${txHelp} (${pct(txHelp)})`} />
        </ListItem>
        <ListItem>
          <ListItemText primary={`Other questions: ${other} (${pct(other)})`} />
        </ListItem>
      </List>
    </Paper>
  );
};

export default AdminAnalytics;