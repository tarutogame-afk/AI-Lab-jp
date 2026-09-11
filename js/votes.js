const sharedVotesSupabaseUrl = 'https://eiwezhlksevvfigdvlax.supabase.co';
const sharedVotesPublishableKey = 'sb_publishable_kIVztGOcUYOvpfbZquANUw_hQwoLB04';
const sharedVotesHeaders = {
  apikey: sharedVotesPublishableKey,
  Authorization: `Bearer ${sharedVotesPublishableKey}`,
};

const fetchSharedCharacterVotes = async () => {
  const endpoint = `${sharedVotesSupabaseUrl}/rest/v1/character_votes?select=character_id,votes`;
  const response = await fetch(endpoint, { headers: sharedVotesHeaders });
  if (!response.ok) throw new Error(`Shared vote count request failed: ${response.status}`);

  const rows = await response.json();
  return new Map(rows.map((row) => [row.character_id, Number(row.votes) || 0]));
};

window.AILabVotes = { fetchAll: fetchSharedCharacterVotes };
