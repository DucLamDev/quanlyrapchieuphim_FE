'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, Calendar, TrendingUp, Info } from 'lucide-react';
import axios from 'axios';

interface CrowdData {
  showtimeId: string;
  crowdLevel: string;
  color: string;
  predictedOccupancy: number;
  currentOccupancy: number;
  availableSeats: number;
  totalSeats: number;
  reasons: string[];
  confidence: number;
  movieTitle: string;
  startTime: string;
  cinema: string;
}

interface CrowdPredictionProps {
  showtimeId: string;
  compact?: boolean;
}

export default function CrowdPrediction({ showtimeId, compact = false }: CrowdPredictionProps) {
  const [prediction, setPrediction] = useState<CrowdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPrediction();
  }, [showtimeId]);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/crowd-prediction/showtime/${showtimeId}`);
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error fetching crowd prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500 text-green-900';
      case 'orange':
        return 'bg-orange-500 text-orange-900';
      case 'red':
        return 'bg-red-500 text-red-900';
      default:
        return 'bg-gray-500 text-gray-900';
    }
  };

  const getBorderClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'border-green-500';
      case 'orange':
        return 'border-orange-500';
      case 'red':
        return 'border-red-500';
      default:
        return 'border-gray-500';
    }
  };

  const getIcon = (level: string) => {
    if (level === 'Thấp') return '😊';
    if (level === 'Trung bình') return '😐';
    return '😰';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-700 rounded-lg" />
      </div>
    );
  }

  if (!prediction) return null;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getColorClass(prediction.color)}`}>
        <Users className="w-4 h-4" />
        <span className="font-semibold text-sm">{prediction.crowdLevel}</span>
        <span className="text-xs opacity-80">({prediction.predictedOccupancy}%)</span>
      </div>
    );
  }

  return (
    <div className={`border-2 ${getBorderClass(prediction.color)} rounded-lg p-4 bg-gray-800/50`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${getColorClass(prediction.color)}`}>
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Dự báo mức độ đông
              <span className="text-2xl">{getIcon(prediction.crowdLevel)}</span>
            </h3>
            <p className={`text-sm font-medium ${getColorClass(prediction.color)}`}>
              {prediction.crowdLevel}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 hover:bg-gray-700 rounded-full transition"
        >
          <Info className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Progress bars */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Dự kiến</span>
            <span className="text-white font-semibold">{prediction.predictedOccupancy}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                prediction.color === 'green' ? 'bg-green-500' :
                prediction.color === 'orange' ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${prediction.predictedOccupancy}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Hiện tại</span>
            <span className="text-white font-semibold">{prediction.currentOccupancy}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${prediction.currentOccupancy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Seats info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Còn trống</p>
          <p className="text-2xl font-bold text-green-400">{prediction.availableSeats}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Tổng ghế</p>
          <p className="text-2xl font-bold text-white">{prediction.totalSeats}</p>
        </div>
      </div>

      {/* Reasons */}
      {prediction.reasons && prediction.reasons.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
          <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Phân tích AI
          </p>
          <ul className="space-y-1">
            {prediction.reasons.map((reason, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence indicator */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Độ tin cậy: {Math.round(prediction.confidence * 100)}%</span>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Cập nhật realtime</span>
        </div>
      </div>

      {/* Detailed info (expandable) */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Phim:</span>
            <span className="text-white font-medium">{prediction.movieTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Rạp:</span>
            <span className="text-white">{prediction.cinema}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Suất chiếu:</span>
            <span className="text-white">
              {new Date(prediction.startTime).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// List view component for comparing multiple showtimes
export function CrowdPredictionList({ movieId }: { movieId: string }) {
  const [predictions, setPredictions] = useState<CrowdData[]>([]);
  const [filter, setFilter] = useState<'all' | 'quiet' | 'popular'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
  }, [movieId, filter]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'quiet' 
        ? `/api/crowd-prediction/quiet/${movieId}`
        : filter === 'popular'
        ? `/api/crowd-prediction/popular/${movieId}`
        : `/api/crowd-prediction/movie/${movieId}`;
      
      const response = await axios.get(endpoint);
      setPredictions(response.data.predictions || response.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Tất cả suất
        </button>
        <button
          onClick={() => setFilter('quiet')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'quiet' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Suất yên tĩnh
        </button>
        <button
          onClick={() => setFilter('popular')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'popular' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Suất nhộn nhịp
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {predictions.map((pred) => (
            <div key={pred.showtimeId} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {new Date(pred.startTime).getHours()}:{String(new Date(pred.startTime).getMinutes()).padStart(2, '0')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(pred.startTime).toLocaleDateString('vi-VN', { weekday: 'short' })}
                    </p>
                  </div>
                  <div>
                    <CrowdPrediction showtimeId={pred.showtimeId} compact />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Còn {pred.availableSeats} ghế</p>
                  <p className="text-lg font-bold text-white">{pred.cinema}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
