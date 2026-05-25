import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const RANCHI_CENTER = { lat: 23.3441, lng: 85.3096 };
const RANCHI_BOUNDS = {
  north: 23.45,
  south: 23.25,
  east: 85.45,
  west: 85.15,
};

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.places) {
      resolve(window.google);
      return;
    }
    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'true';
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function BookingForm({ onBook, loading, apiKey }) {
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [distance, setDistance] = useState(null);
  const pickupRef = useRef(null);
  const dropRef = useRef(null);
  const pickupPlaceRef = useRef(null);
  const dropPlaceRef = useRef(null);

  const initAutocomplete = useCallback(async () => {
    if (!apiKey) return;
    try {
      await loadGoogleMaps(apiKey);
      const options = {
        bounds: new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(RANCHI_BOUNDS.south, RANCHI_BOUNDS.west),
          new window.google.maps.LatLng(RANCHI_BOUNDS.north, RANCHI_BOUNDS.east)
        ),
        strictBounds: false,
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'name'],
      };

      if (pickupRef.current) {
        const ac = new window.google.maps.places.Autocomplete(pickupRef.current, options);
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          pickupPlaceRef.current = place;
          setPickup(place.formatted_address || place.name || pickupRef.current.value);
        });
      }

      if (dropRef.current) {
        const ac = new window.google.maps.places.Autocomplete(dropRef.current, options);
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          dropPlaceRef.current = place;
          setDrop(place.formatted_address || place.name || dropRef.current.value);
        });
      }
    } catch (err) {
      console.error('Google Maps load error:', err);
    }
  }, [apiKey]);

  useEffect(() => {
    initAutocomplete();
  }, [initAutocomplete]);

  useEffect(() => {
    if (pickupPlaceRef.current?.geometry && dropPlaceRef.current?.geometry && window.google) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [pickupPlaceRef.current.geometry.location],
          destinations: [dropPlaceRef.current.geometry.location],
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === 'OK' && response.rows[0]?.elements[0]?.status === 'OK') {
            setDistance(response.rows[0].elements[0].distance.text);
          }
        }
      );
    } else if (pickup && drop) {
      setDistance(null);
    }
  }, [pickup, drop]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickup.trim() || !drop.trim()) return;
    onBook({ pickup: pickup.trim(), drop: drop.trim() });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6 md:p-8 space-y-5 max-w-xl mx-auto w-full"
    >
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 text-lg">📍</span>
        <input
          ref={pickupRef}
          type="text"
          placeholder="Pickup location in Ranchi"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
          required
        />
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 text-lg">🚩</span>
        <input
          ref={dropRef}
          type="text"
          placeholder="Drop location in Ranchi"
          value={drop}
          onChange={(e) => setDrop(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple transition-colors"
          required
        />
      </div>

      {distance && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-400 text-center"
        >
          Estimated distance: <span className="text-white font-medium">{distance}</span>
        </motion.p>
      )}

      <button
        type="submit"
        disabled={loading || !pickup || !drop}
        className="w-full py-4 rounded-xl font-semibold text-white gradient-btn disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Racing cabs...
          </span>
        ) : (
          'Find Cab'
        )}
      </button>
    </motion.form>
  );
}

export { RANCHI_CENTER };
