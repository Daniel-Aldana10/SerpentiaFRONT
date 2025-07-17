import React from 'react';


// Renombrar la interfaz de props
type UserStatisticsData = {
  gamesPlayed: number;
  gamesWon: number;
  totalPoints: number;
  bigPoints: number;
  ratioWin: number;
};

interface UserStatisticsProps {
  onNavigate: (screen: string, params?: any) => void;
}

const UserStatistics: React.FC<UserStatisticsProps> = ({ onNavigate }) => {
  const [stats, setStats] = React.useState<UserStatisticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('No se pudo obtener las estadísticas');
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Cargando estadísticas...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No hay estadísticas disponibles.</div>;

  // Función para calcular el ancho de la barra (máximo 100%)
  const getBarWidth = (value: number, max: number) => `${Math.min((value / max) * 100, 100)}%`;
  // Definir máximos para las barras (puedes ajustar estos valores)
  const maxGames = Math.max(stats.gamesPlayed, 10);
  const maxPoints = Math.max(stats.totalPoints, 1000);
  const maxBigPoints = Math.max(stats.bigPoints, 500);

  return (
    <div className="user-statistics-container">
      <h2>Estadísticas de Usuario</h2>
      <div className="stat-row">
        <span>Partidas jugadas: {stats.gamesPlayed}</span>
        <div className="stat-bar" style={{ width: getBarWidth(stats.gamesPlayed, maxGames) }} />
      </div>
      <div className="stat-row">
        <span>Partidas ganadas: {stats.gamesWon}</span>
        <div className="stat-bar" style={{ width: getBarWidth(stats.gamesWon, maxGames) }} />
      </div>
      <div className="stat-row">
        <span>Puntos totales: {stats.totalPoints}</span>
        <div className="stat-bar" style={{ width: getBarWidth(stats.totalPoints, maxPoints) }} />
      </div>
      <div className="stat-row">
        <span>Puntos grandes: {stats.bigPoints}</span>
        <div className="stat-bar" style={{ width: getBarWidth(stats.bigPoints, maxBigPoints) }} />
      </div>
      <div className="stat-row">
        <span>Ratio de victorias: {stats.ratioWin}%</span>
        <div className="stat-bar" style={{ width: `${stats.ratioWin}%` }} />
      </div>
      <button onClick={() => onNavigate('lobby')}>Volver al lobby</button>
    </div>
  );
};

export default UserStatistics; 