import React, { useState, useEffect, createContext, useContext } from 'react';
import { Calculator, Download, DollarSign, User, LogOut, Save, History, Eye, Trash2 } from 'lucide-react';

const AuthContext = createContext();

// Servicios simulados
const mockAuthService = {
  login: async (email, password) => {
    const users = [
      { id: 1, email: 'admin@simulador.com', password: 'admin123', name: 'Administrador' },
      { id: 2, email: 'usuario@demo.com', password: 'demo123', name: 'Usuario Demo' },
      { id: 3, email: 'test@test.com', password: 'test123', name: 'Usuario Test' }
    ];
    
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      return { success: true, user: { id: user.id, email: user.email, name: user.name } };
    }
    return { success: false, message: 'Credenciales inválidas' };
  }
};

// Provider de autenticación
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    const result = await mockAuthService.login(email, password);
    if (result.success) {
      setUser(result.user);
    }
    setLoading(false);
    return result;
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

// Componente de Login
const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async () => {
    setError('');
    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setError(result.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Calculator className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Simulador de Préstamos</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Iniciar sesión'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 mb-2">Cuentas demo:</p>
          <div className="text-xs space-y-1">
            <div>admin@simulador.com / admin123</div>
            <div>usuario@demo.com / demo123</div>
            <div>test@test.com / test123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal del simulador
const SimulatorApp = () => {
  const { user, logout } = useAuth();
  const [showGermanModal, setShowGermanModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Estados del formulario
  const [clientData, setClientData] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: ''
  });

  const [loanData, setLoanData] = useState({
    amount: '',
    periods: '',
    rate: '',
    currency: 'ARS',
    system: 'french',
    frequency: 'monthly',
    liquidationDate: '',
    firstPaymentDate: '',
    gracePeriods: 0,
    graceType: 'total',
    ivaEnabled: false,
    ivaRate: 10.5,
    isGermanManual: false
  });

  const [germanCapitals, setGermanCapitals] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [errors, setErrors] = useState({});

  // Función para obtener símbolo de moneda
  const getCurrencySymbol = (currency) => {
    const symbols = {
      'ARS': '$',
      'USD': 'US$',
      'EUR': '€',
      'SOJ': 'SOJ'
    };
    return symbols[currency] || '$';
  };

  // Función para formatear números
  const formatNumber = (num) => {
    if (isNaN(num) || num === null || num === undefined) return '0,00';
    return Number(num).toLocaleString('es-AR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!clientData.name.trim()) newErrors.clientName = 'Nombre requerido';
    if (!clientData.document.trim()) newErrors.clientDocument = 'Documento requerido';
    if (!loanData.amount || loanData.amount <= 0) newErrors.amount = 'Capital debe ser mayor a 0';
    if (!loanData.periods || loanData.periods <= 0) newErrors.periods = 'Períodos debe ser mayor a 0';
    if (!loanData.rate || loanData.rate <= 0) newErrors.rate = 'TNA debe ser mayor a 0';
    if (!loanData.liquidationDate) newErrors.liquidationDate = 'Fecha de liquidación requerida';
    if (!loanData.firstPaymentDate) newErrors.firstPaymentDate = 'Fecha primera cuota requerida';

    if (loanData.system === 'german' && loanData.isGermanManual) {
      const totalCapitals = germanCapitals.reduce((sum, cap) => sum + (parseFloat(cap) || 0), 0);
      const expectedTotal = parseFloat(loanData.amount);
      if (Math.abs(totalCapitals - expectedTotal) > 0.01) {
        newErrors.germanCapitals = 'La suma de capitales debe igual al monto del préstamo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para calcular cronograma
  const calculateSchedule = () => {
    if (!validateForm()) return;

    const capital = parseFloat(loanData.amount);
    const periods = parseInt(loanData.periods);
    const annualRate = parseFloat(loanData.rate) / 100;
    const liquidationDate = new Date(loanData.liquidationDate);
    const firstPaymentDate = new Date(loanData.firstPaymentDate);
    
    const gracePeriods = (loanData.system === 'german' && loanData.isGermanManual) ? 
      parseInt(loanData.gracePeriods) || 0 : 0;
    
    // Calcular período según frecuencia
    let periodsPerYear;
    switch(loanData.frequency) {
      case 'monthly': periodsPerYear = 12; break;
      case 'quarterly': periodsPerYear = 4; break;
      case 'semiannual': periodsPerYear = 2; break;
      case 'annual': periodsPerYear = 1; break;
      default: periodsPerYear = 12;
    }
    
    const periodRate = annualRate / periodsPerYear;
    let newSchedule = [];
    
    // Calcular días entre liquidación y primera cuota
    const daysFirstPeriod = Math.ceil((firstPaymentDate.getTime() - liquidationDate.getTime()) / (24 * 60 * 60 * 1000));
    
    if (loanData.system === 'french') {
      // Sistema Francés
      const payment = capital * (periodRate * Math.pow(1 + periodRate, periods)) / 
                     (Math.pow(1 + periodRate, periods) - 1);
      
      let balance = capital;
      let currentDate = new Date(firstPaymentDate.getTime());
      
      for (let i = 1; i <= periods; i++) {
        let interestPayment, principalPayment;
        
        if (i === 1) {
          interestPayment = balance * (annualRate * daysFirstPeriod / 360);
        } else {
          interestPayment = balance * periodRate;
        }
        
        principalPayment = payment - interestPayment;
        if (principalPayment < 0) principalPayment = 0;
        
        const ivaAmount = loanData.ivaEnabled ? interestPayment * (loanData.ivaRate / 100) : 0;
        const totalPayment = principalPayment + interestPayment + ivaAmount;
        
        newSchedule.push({
          period: i,
          date: new Date(currentDate.getTime()),
          days: i === 1 ? daysFirstPeriod : Math.round(360 / periodsPerYear),
          principalPayment: principalPayment,
          interestPayment: interestPayment,
          ivaAmount: ivaAmount,
          totalPayment: totalPayment,
          balance: balance - principalPayment
        });
        
        balance -= principalPayment;
        
        if (loanData.frequency === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (loanData.frequency === 'quarterly') {
          currentDate.setMonth(currentDate.getMonth() + 3);
        } else if (loanData.frequency === 'semiannual') {
          currentDate.setMonth(currentDate.getMonth() + 6);
        } else if (loanData.frequency === 'annual') {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
      }
    } else if (loanData.system === 'german') {
      // Sistema Alemán
      let balance = capital;
      let currentDate = new Date(firstPaymentDate.getTime());
      
      for (let i = 1; i <= periods; i++) {
        let principalPayment;
        
        if (loanData.isGermanManual && germanCapitals.length > 0) {
          principalPayment = parseFloat(germanCapitals[i - 1]) || 0;
        } else {
          principalPayment = capital / periods;
        }
        
        let interestPayment;
        if (i === 1) {
          interestPayment = balance * (annualRate * daysFirstPeriod / 360);
        } else {
          interestPayment = balance * periodRate;
        }
        
        if (loanData.isGermanManual && i <= gracePeriods && loanData.graceType === 'total') {
          interestPayment = 0;
        }
        
        const ivaAmount = loanData.ivaEnabled ? interestPayment * (loanData.ivaRate / 100) : 0;
        const totalPayment = principalPayment + interestPayment + ivaAmount;
        
        newSchedule.push({
          period: i,
          date: new Date(currentDate.getTime()),
          days: i === 1 ? daysFirstPeriod : Math.round(360 / periodsPerYear),
          principalPayment: principalPayment,
          interestPayment: interestPayment,
          ivaAmount: ivaAmount,
          totalPayment: totalPayment,
          balance: balance - principalPayment
        });
        
        balance -= principalPayment;
        
        if (loanData.frequency === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (loanData.frequency === 'quarterly') {
          currentDate.setMonth(currentDate.getMonth() + 3);
        } else if (loanData.frequency === 'semiannual') {
          currentDate.setMonth(currentDate.getMonth() + 6);
        } else if (loanData.frequency === 'annual') {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
      }
    } else if (loanData.system === 'american') {
      // Sistema Americano
      let currentDate = new Date(firstPaymentDate.getTime());
      
      for (let i = 1; i <= periods; i++) {
        let principalPayment = (i === periods) ? capital : 0;
        let interestPayment;
        
        if (i === 1) {
          interestPayment = capital * (annualRate * daysFirstPeriod / 360);
        } else {
          interestPayment = capital * periodRate;
        }
        
        const ivaAmount = loanData.ivaEnabled ? interestPayment * (loanData.ivaRate / 100) : 0;
        const totalPayment = principalPayment + interestPayment + ivaAmount;
        
        newSchedule.push({
          period: i,
          date: new Date(currentDate.getTime()),
          days: i === 1 ? daysFirstPeriod : Math.round(360 / periodsPerYear),
          principalPayment: principalPayment,
          interestPayment: interestPayment,
          ivaAmount: ivaAmount,
          totalPayment: totalPayment,
          balance: i === periods ? 0 : capital
        });
        
        if (loanData.frequency === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (loanData.frequency === 'quarterly') {
          currentDate.setMonth(currentDate.getMonth() + 3);
        } else if (loanData.frequency === 'semiannual') {
          currentDate.setMonth(currentDate.getMonth() + 6);
        } else if (loanData.frequency === 'annual') {
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
      }
    }
    
    setSchedule(newSchedule);
  };

  // Funciones simplificadas
  const clearData = () => {
    if (window.confirm('¿Limpiar todos los datos?')) {
      setClientData({ name: '', document: '', phone: '', email: '', address: '' });
      setLoanData({
        amount: '', periods: '', rate: '', currency: 'ARS', system: 'french',
        frequency: 'monthly', liquidationDate: '', firstPaymentDate: '',
        gracePeriods: 0, graceType: 'total', ivaEnabled: false, ivaRate: 10.5, isGermanManual: false
      });
      setGermanCapitals([]);
      setSchedule([]);
      setErrors({});
      alert('Datos limpiados correctamente');
    }
  };

  const saveSimulation = () => {
    if (schedule.length === 0) {
      alert('Calcule el cronograma antes de guardar');
      return;
    }
    const name = window.prompt('Nombre de la simulación:');
    if (!name) return;
    
    const simulation = { name, clientData, loanData, germanCapitals, schedule, timestamp: new Date().toISOString() };
    const saved = localStorage.getItem('savedSimulations');
    const simulations = saved ? JSON.parse(saved) : [];
    simulations.push(simulation);
    localStorage.setItem('savedSimulations', JSON.stringify(simulations));
    alert('Simulación guardada correctamente');
  };

  const exportToCSV = () => {
    if (schedule.length === 0) {
      alert('Calcule el cronograma antes de exportar');
      return;
    }

    const currencySymbol = getCurrencySymbol(loanData.currency);
    let csvContent = 'CRONOGRAMA DE PAGOS\n\n';
    
    if (clientData.name) csvContent += `Nombre;${clientData.name}\n`;
    if (clientData.document) csvContent += `Documento;${clientData.document}\n`;
    if (clientData.phone) csvContent += `Telefono;${clientData.phone}\n`;
    if (clientData.email) csvContent += `Email;${clientData.email}\n`;
    if (clientData.address) csvContent += `Direccion;${clientData.address}\n`;
    
    csvContent += '\nPARAMETROS DEL PRESTAMO\n';
    csvContent += `Capital;${currencySymbol}${loanData.amount}\n`;
    csvContent += `TNA;${loanData.rate}%\n`;
    csvContent += `Plazo;${loanData.periods} periodos\n`;
    csvContent += `Sistema;${loanData.system === 'french' ? 'Frances' : loanData.system === 'german' ? 'Aleman' : 'Americano'}\n`;
    csvContent += `Periodicidad;${loanData.frequency === 'monthly' ? 'Mensual' : loanData.frequency === 'quarterly' ? 'Trimestral' : loanData.frequency === 'semiannual' ? 'Semestral' : 'Anual'}\n`;
    csvContent += `Moneda;${loanData.currency}\n\n`;
    csvContent += 'CRONOGRAMA DE PAGOS\n';
    csvContent += 'Cuota;Vencimiento;Dias;Capital;Interes';
    if (loanData.ivaEnabled) csvContent += ';IVA';
    csvContent += ';Cuota Total;Saldo\n';
    
    schedule.forEach(row => {
      csvContent += `${row.period};${row.date.toLocaleDateString('es-AR')};${row.days};${row.principalPayment.toFixed(2)};${row.interestPayment.toFixed(2)}`;
      if (loanData.ivaEnabled) csvContent += `;${row.ivaAmount.toFixed(2)}`;
      csvContent += `;${row.totalPayment.toFixed(2)};${row.balance.toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cronograma-${clientData.name || 'simulacion'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    alert('Archivo CSV exportado correctamente');
  };

  // Modal alemán manual simplificado
  const GermanManualModal = () => {
    const [localCapitals, setLocalCapitals] = useState([...germanCapitals]);
    
    useEffect(() => {
      if (showGermanModal && loanData.periods) {
        const periods = parseInt(loanData.periods);
        const capitals = new Array(periods).fill('').map((_, index) => 
          germanCapitals[index] || ''
        );
        setLocalCapitals(capitals);
      }
    }, [showGermanModal]);
    
    const handleDistributeEqual = () => {
      const amount = parseFloat(loanData.amount) || 0;
      const periods = parseInt(loanData.periods) || 1;
      const equalAmount = (amount / periods).toFixed(2);
      setLocalCapitals(new Array(periods).fill(equalAmount));
    };
    
    const handleSave = () => {
      setGermanCapitals([...localCapitals]);
      setShowGermanModal(false);
    };
    
    const totalCapitals = localCapitals.reduce((sum, cap) => sum + (parseFloat(cap) || 0), 0);
    const expectedTotal = parseFloat(loanData.amount) || 0;
    
    if (!showGermanModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold">Configurar Capitales por Cuota</h3>
            <button
              onClick={handleDistributeEqual}
              className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
            >
              Distribuir Parejo
            </button>
          </div>
          
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localCapitals.map((capital, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuota {index + 1}
                  </label>
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => {
                      const newCapitals = [...localCapitals];
                      newCapitals[index] = e.target.value;
                      setLocalCapitals(newCapitals);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="mb-4 text-sm">
              <div>Total: {getCurrencySymbol(loanData.currency)}{formatNumber(totalCapitals)}</div>
              <div>Esperado: {getCurrencySymbol(loanData.currency)}{formatNumber(expectedTotal)}</div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowGermanModal(false)} className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={Math.abs(totalCapitals - expectedTotal) > 0.01}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Simulador de Préstamos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                <User className="h-4 w-4 inline mr-1" />
                {user.name}
              </span>
              <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">
                <LogOut className="h-4 w-4 inline mr-1" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-6">Configuración</h2>
              
              {/* Datos del Cliente */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Datos del Cliente</h3>
                <div className="space-y-4">
                  {['name', 'document', 'phone', 'email', 'address'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field === 'name' ? 'Nombre *' : 
                         field === 'document' ? 'Documento *' :
                         field === 'phone' ? 'Teléfono' :
                         field === 'email' ? 'Email' : 'Dirección'}
                      </label>
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        value={clientData[field]}
                        onChange={(e) => setClientData({...clientData, [field]: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          (field === 'name' && errors.clientName) || (field === 'document' && errors.clientDocument) ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {field === 'name' && errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
                      {field === 'document' && errors.clientDocument && <p className="text-red-500 text-xs mt-1">{errors.clientDocument}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Parámetros del Préstamo */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Parámetros del Préstamo</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                    <select
                      value={loanData.currency}
                      onChange={(e) => setLoanData({...loanData, currency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ARS">Peso Argentino (ARS)</option>
                      <option value="USD">Dólar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="SOJ">Soja (SOJ)</option>
                    </select>
                  </div>

                  {['amount', 'periods', 'rate'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field === 'amount' ? 'Capital *' : 
                         field === 'periods' ? 'Períodos *' : 'TNA (%) *'}
                      </label>
                      <input
                        type="number"
                        value={loanData[field]}
                        onChange={(e) => setLoanData({...loanData, [field]: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors[field] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        step="0.01"
                      />
                      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                    </div>
                  ))}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sistema</label>
                    <select
                      value={loanData.system}
                      onChange={(e) => setLoanData({...loanData, system: e.target.value, isGermanManual: false, gracePeriods: 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="french">Francés</option>
                      <option value="german">Alemán</option>
                      <option value="american">Americano</option>
                    </select>
                  </div>

                  {loanData.system === 'german' && (
                    <>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={loanData.isGermanManual}
                          onChange={(e) => setLoanData({...loanData, isGermanManual: e.target.checked, gracePeriods: e.target.checked ? loanData.gracePeriods : 0})}
                          className="mr-2"
                        />
                        <label className="text-sm text-gray-700">Manual</label>
                      </div>

                      {loanData.isGermanManual && (
                        <button
                          onClick={() => setShowGermanModal(true)}
                          disabled={!loanData.periods || loanData.periods <= 0}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          Configurar Capitales
                        </button>
                      )}

                      {loanData.isGermanManual && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Períodos de gracia</label>
                            <input
                              type="number"
                              value={loanData.gracePeriods}
                              onChange={(e) => setLoanData({...loanData, gracePeriods: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              min="0"
                            />
                          </div>
                          
                          {loanData.gracePeriods > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de gracia</label>
                              <select
                                value={loanData.graceType}
                                onChange={(e) => setLoanData({...loanData, graceType: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="total">Total</option>
                                <option value="partial">Parcial</option>
                              </select>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                    <select
                      value={loanData.frequency}
                      onChange={(e) => setLoanData({...loanData, frequency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="monthly">Mensual</option>
                      <option value="quarterly">Trimestral</option>
                      <option value="semiannual">Semestral</option>
                      <option value="annual">Anual</option>
                    </select>
                  </div>

                  {['liquidationDate', 'firstPaymentDate'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field === 'liquidationDate' ? 'Fecha liquidación *' : 'Fecha primera cuota *'}
                      </label>
                      <input
                        type="date"
                        value={loanData[field]}
                        onChange={(e) => setLoanData({...loanData, [field]: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors[field] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                    </div>
                  ))}
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={loanData.ivaEnabled}
                      onChange={(e) => setLoanData({...loanData, ivaEnabled: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">IVA sobre intereses</label>
                  </div>
                  
                  {loanData.ivaEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alícuota IVA (%)</label>
                      <select
                        value={loanData.ivaRate}
                        onChange={(e) => setLoanData({...loanData, ivaRate: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={10.5}>10.5%</option>
                        <option value={21}>21%</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <button onClick={calculateSchedule} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                  <Calculator className="h-4 w-4 inline mr-2" />
                  Calcular
                </button>
                
                <button onClick={clearData} className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
                  Limpiar
                </button>

                <div className="flex gap-2">
                  <button onClick={saveSimulation} disabled={schedule.length === 0} className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50">
                    <Save className="h-4 w-4 inline mr-2" />
                    Guardar
                  </button>
                  
                  <button onClick={exportToCSV} disabled={schedule.length === 0} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
                    <Download className="h-4 w-4 inline mr-2" />
                    CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-2">
            {schedule.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Resumen</h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{getCurrencySymbol(loanData.currency)}{formatNumber(loanData.amount)}</div>
                    <div className="text-sm text-gray-600">Capital</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{loanData.rate}%</div>
                    <div className="text-sm text-gray-600">TNA</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{loanData.periods}</div>
                    <div className="text-sm text-gray-600">Plazo</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">
                      {loanData.system === 'french' ? 'Francés' : loanData.system === 'german' ? 'Alemán' : 'Americano'}
                    </div>
                    <div className="text-sm text-gray-600">Sistema</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">
                      {loanData.frequency === 'monthly' ? 'Mensual' : loanData.frequency === 'quarterly' ? 'Trimestral' : loanData.frequency === 'semiannual' ? 'Semestral' : 'Anual'}
                    </div>
                    <div className="text-sm text-gray-600">Periodicidad</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Cronograma de Pagos</h2>
              </div>
              
              {schedule.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuota</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Capital</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Interés</th>
                        {loanData.ivaEnabled && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">IVA</th>}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saldo</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {schedule.map((row, index) => (
                        <tr key={index} className={`${
                          loanData.system === 'german' && loanData.isGermanManual && index < parseInt(loanData.gracePeriods) ? 'bg-yellow-50' : 
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.period}
                            {loanData.system === 'german' && loanData.isGermanManual && index < parseInt(loanData.gracePeriods) && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Gracia
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date.toLocaleDateString('es-AR')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.days}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(row.principalPayment)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(row.interestPayment)}</td>
                          {loanData.ivaEnabled && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(row.ivaAmount)}</td>}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{formatNumber(row.totalPayment)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cronograma calculado</h3>
                  <p className="text-gray-500">Complete los datos y haga clic en "Calcular"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <GermanManualModal />
    </div>
  );
};

// Componente principal
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent = () => {
  const { user } = useAuth();
  return user ? <SimulatorApp /> : <LoginForm />;
};

export default App;