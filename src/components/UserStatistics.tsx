import React from 'react';
import { fetchUserStatistics } from '../api/ApiUser';
import { useUser } from '../context/UserContext';
import '../App.css';

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
  const { username } = useUser();

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserStatistics();
        setStats(data);
      } catch (err: any) {
        setError('No se pudo obtener las estadísticas');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="user-statistics-container">Cargando estadísticas...</div>;
  if (error) return <div className="user-statistics-container">Error: {error}</div>;
  if (!stats) return <div className="user-statistics-container">No hay estadísticas disponibles.</div>;

  // Función para calcular el ancho de la barra (máximo 100%)
  const getBarWidth = (value: number, max: number) => `${Math.min((value / max) * 100, 100)}%`;
  // Definir máximos para las barras (puedes ajustar estos valores)
  const maxGames = Math.max(stats.gamesPlayed, 10);
  const maxPoints = Math.max(stats.totalPoints, 1000);
  const maxBigPoints = Math.max(stats.bigPoints, 500);

  return (
    <div className="user-statistics-container profile-stats">
      <div className="profile-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: 64, marginBottom: 8 }}>🐍</span>
        <h2 style={{ margin: 0, fontWeight: 700 }}>{username || 'Usuario'}</h2>
      </div>
      <h3 style={{ textAlign: 'center', marginBottom: 24 }}>Estadísticas de Usuario</h3>
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
      <button className="btn btn-primary" style={{ marginTop: 32, minWidth: 180 }} onClick={() => onNavigate('rooms')}>Volver al lobby</button>
    </div>
  );
};

export default UserStatistics; 