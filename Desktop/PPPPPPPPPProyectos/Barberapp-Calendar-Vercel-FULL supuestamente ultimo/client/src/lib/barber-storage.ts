// Enhanced storage for client's barber information
interface SavedBarber {
  barberId: string;
  name: string;
  shopName: string;
  savedAt: string;
}

export const BarberStorage = {
  // Save barber when client first visits their booking page
  saveBarber: (barberId: string, barberName: string, shopName: string): boolean => {
    try {
      const existingBarbers = BarberStorage.getSavedBarbers();
      const existingIndex = existingBarbers.findIndex((b: SavedBarber) => b.barberId === barberId);
      
      const barberInfo: SavedBarber = {
        barberId: barberId,
        name: barberName,
        shopName: shopName,
        savedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        // Update existing barber
        existingBarbers[existingIndex] = barberInfo;
      } else {
        // Add new barber
        existingBarbers.push(barberInfo);
      }

      localStorage.setItem('savedBarbers', JSON.stringify(existingBarbers));
      return true;
    } catch (error) {
      console.error('No se pudo guardar el barbero:', error);
      return false;
    }
  },

  // Get all saved barbers
  getSavedBarbers: (): SavedBarber[] => {
    try {
      const saved = localStorage.getItem('savedBarbers');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error al obtener barberos guardados:', error);
      return [];
    }
  },

  // Get saved barber information (legacy method)
  getSavedBarber: () => {
    try {
      const saved = localStorage.getItem('myBarber');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error al obtener barbero guardado:', error);
      return null;
    }
  },

  // Remove specific barber
  removeBarber: (barberId: string): boolean => {
    try {
      const existingBarbers = BarberStorage.getSavedBarbers();
      const filteredBarbers = existingBarbers.filter((b: SavedBarber) => b.barberId !== barberId);
      localStorage.setItem('savedBarbers', JSON.stringify(filteredBarbers));
      return true;
    } catch (error) {
      console.error('Error al eliminar barbero:', error);
      return false;
    }
  },

  // Check if a barber is currently saved
  hasBarberSaved: () => {
    return localStorage.getItem('myBarber') !== null;
  }
};