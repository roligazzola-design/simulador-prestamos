import React, { useState, useEffect } from 'react';

// Usuarios demo
const DEMO_USERS = [
  { email: 'admin@simulador.com', password: 'admin123' },
  { email: 'usuario@demo.com', password: 'demo123' },
  { email: 'test@test.com', password: 'test123' }
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados del formulario
  const [clientName, setClientName] = useState('');
  const [clientDoc, setClientDoc] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const [capital, setCapital] = useState('');
  const [periods, setPeriods] = useState('');
  const [tna, setTna] = useState('');
  const [system, setSystem] = useState('frances');
  const [periodicity, setPeriodicity] = useState('mensual');
  const [liquidationDate, setLiquidationDate] = useState('');
  const [firstPaymentDate, setFirstPaymentDate] = useState('');
  const [currency, setCurrency] = useState('ARS');
  
  const [isManual, setIsManual] = useState(false);
  const [manualCapitals, setManualCapitals] = useState([]);
  const [showManualModal, setShowManualModal] = useState(false);
  
  const [gracePeriods, setGracePeriods] = useState(0);
  const [graceType, setGraceType] = useState('total');
  
  const [hasIVA, setHasIVA] = useState(false);
  const [ivaRate, setIvaRate] = useState(21);

  const [schedule, setSchedule] = useState([]);
  const [summary, setSummary] = useState(null);
  const [savedSimulations, setSavedSimulations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Cargar simulaciones guardadas
  useEffect(() => {
    const saved = localStorage.getItem('savedSimulations');
    if (saved) {
      setSavedSimulations(JSON.parse(saved));
    }
  }, []);

  // Símbolos de moneda
  const getCurrencySymbol = (curr) => {
    const symbols = {
      'ARS': '$',
      'USD': 'U$S',
      'EUR': '€',
      'SOJ': 'SOJ'
    };
    return symbols[curr] || '$';
  };

  // Función de login
  const handleLogin = () => {
    const user = DEMO_USERS.find(
      u => u.email === loginEmail && u.password === loginPassword
    );
    if (user) {
      setIsAuthenticated(true);
    } else {
      alert('Credenciales incorrectas');
    }
  };

  // Función para calcular días entre fechas
  const getDaysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Función para agregar días a una fecha
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Función para agregar meses a una fecha
  const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  };

  // Calcular días según periodicidad
  const getDaysByPeriodicity = (periodicity) => {
    const days = {
      'mensual': 30,
      'bimestral': 60,
      'trimestral': 90,
      'cuatrimestral': 120,
      'semestral': 180,
      'anual': 360
    };
    return days[periodicity] || 30;
  };

  // Formatear fecha para mostrar
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Formatear número
  const formatNumber = (num) => {
    return num.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calcular cronograma
  const calculateSchedule = () => {
    if (!capital || !periods || !tna || !liquidationDate) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    const cap = parseFloat(capital);
    const per = parseInt(periods);
    const rate = parseFloat(tna) / 100;
    const monthlyRate = rate / 12;

    let currentSchedule = [];
    let balance = cap;

    // Sistema Francés: Calcular primera fecha automáticamente
    let currentDate;
    if (system === 'frances') {
      const daysToAdd = getDaysByPeriodicity(periodicity);
      currentDate = addDays(new Date(liquidationDate), daysToAdd);
    } else {
      // Alemán y Americano: usar fecha manual
      if (!firstPaymentDate) {
        alert('Complete la fecha de primera cuota');
        return;
      }
      currentDate = new Date(firstPaymentDate);
    }

    let previousDate = new Date(liquidationDate);

    if (system === 'frances') {
      // Sistema Francés
      const periodsWithoutGrace = per;
      const quota = (cap * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -periodsWithoutGrace));

      for (let i = 1; i <= per; i++) {
        const days = getDaysBetween(previousDate, currentDate);
        const interest = balance * (rate / 360) * days;
        let capitalPayment = quota - interest;
        let ivaAmount = 0;

        if (hasIVA) {
          ivaAmount = interest * (ivaRate / 100);
        }

        const totalPayment = quota + ivaAmount;
        balance = balance - capitalPayment;

        currentSchedule.push({
          period: i,
          date: formatDate(currentDate),
          days: days,
          capital: capitalPayment,
          interest: interest,
          iva: ivaAmount,
          total: totalPayment,
          balance: balance > 0 ? balance : 0
        });

        previousDate = new Date(currentDate);
        const daysToAdd = getDaysByPeriodicity(periodicity);
        currentDate = addDays(currentDate, daysToAdd);
      }
    } else if (system === 'aleman') {
      // Sistema Alemán
      if (isManual && manualCapitals.length > 0) {
        // Manual
        for (let i = 1; i <= per; i++) {
          const days = getDaysBetween(previousDate, currentDate);
          const interest = balance * (rate / 360) * days;
          const capitalPayment = manualCapitals[i - 1] || 0;
          let ivaAmount = 0;

          if (hasIVA) {
            ivaAmount = interest * (ivaRate / 100);
          }

          const totalPayment = capitalPayment + interest + ivaAmount;
          balance = balance - capitalPayment;

          const isGracePeriod = i <= gracePeriods;

          currentSchedule.push({
            period: i,
            date: formatDate(currentDate),
            days: days,
            capital: capitalPayment,
            interest: interest,
            iva: ivaAmount,
            total: totalPayment,
            balance: balance > 0 ? balance : 0,
            isGrace: isGracePeriod
          });

          previousDate = new Date(currentDate);
          const daysToAdd = getDaysByPeriodicity(periodicity);
          currentDate = addDays(currentDate, daysToAdd);
        }
      } else {
        // Automático
        const capitalPayment = cap / per;

        for (let i = 1; i <= per; i++) {
          const days = getDaysBetween(previousDate, currentDate);
          const interest = balance * (rate / 360) * days;
          let ivaAmount = 0;

          if (hasIVA) {
            ivaAmount = interest * (ivaRate / 100);
          }

          const totalPayment = capitalPayment + interest + ivaAmount;
          balance = balance - capitalPayment;

          currentSchedule.push({
            period: i,
            date: formatDate(currentDate),
            days: days,
            capital: capitalPayment,
            interest: interest,
            iva: ivaAmount,
            total: totalPayment,
            balance: balance > 0 ? balance : 0
          });

          previousDate = new Date(currentDate);
          const daysToAdd = getDaysByPeriodicity(periodicity);
          currentDate = addDays(currentDate, daysToAdd);
        }
      }
    } else if (system === 'americano') {
      // Sistema Americano
      for (let i = 1; i <= per; i++) {
        const days = getDaysBetween(previousDate, currentDate);
        const interest = balance * (rate / 360) * days;
        const capitalPayment = i === per ? balance : 0;
        let ivaAmount = 0;

        if (hasIVA) {
          ivaAmount = interest * (ivaRate / 100);
        }

        const totalPayment = capitalPayment + interest + ivaAmount;
        balance = balance - capitalPayment;

        currentSchedule.push({
          period: i,
          date: formatDate(currentDate),
          days: days,
          capital: capitalPayment,
          interest: interest,
          iva: ivaAmount,
          total: totalPayment,
          balance: balance > 0 ? balance : 0
        });

        previousDate = new Date(currentDate);
        const daysToAdd = getDaysByPeriodicity(periodicity);
        currentDate = addDays(currentDate, daysToAdd);
      }
    }

    setSchedule(currentSchedule);

    // Calcular resumen
    const totalCapital = currentSchedule.reduce((sum, item) => sum + item.capital, 0);
    const totalInterest = currentSchedule.reduce((sum, item) => sum + item.interest, 0);
    const totalIVA = currentSchedule.reduce((sum, item) => sum + item.iva, 0);
    const totalAmount = currentSchedule.reduce((sum, item) => sum + item.total, 0);

    setSummary({
      totalCapital,
      totalInterest,
      totalIVA,
      totalAmount
    });
  };

  // Modal para sistema Alemán Manual
  const openManualModal = () => {
    const per = parseInt(periods);
    if (!per) {
      alert('Ingrese la cantidad de períodos primero');
      return;
    }
    const caps = Array(per).fill(0);
    setManualCapitals(caps);
    setShowManualModal(true);
  };

  const distributeEvenly = () => {
    const cap = parseFloat(capital);
    const per = parseInt(periods);
    const effectivePeriods = per - gracePeriods;
    
    if (!cap || !per) return;
    
    const perCapital = cap / effectivePeriods;
    const newCaps = manualCapitals.map((_, index) => {
      if (index < gracePeriods) {
        return 0;
      }
      return perCapital;
    });
    setManualCapitals(newCaps);
  };

  const updateManualCapital = (index, value) => {
    const newCaps = [...manualCapitals];
    newCaps[index] = parseFloat(value) || 0;
    setManualCapitals(newCaps);
  };

  const saveManualCapitals = () => {
    const total = manualCapitals.reduce((sum, val) => sum + val, 0);
    const cap = parseFloat(capital);
    if (Math.abs(total - cap) > 0.01) {
      alert(`La suma de capitales (${total.toFixed(2)}) debe ser igual al capital total (${cap.toFixed(2)})`);
      return;
    }
    setShowManualModal(false);
  };

  // Exportar a CSV
  const exportToCSV = () => {
    if (schedule.length === 0) {
      alert('Calcule el cronograma antes de exportar');
      return;
    }

    let csv = 'CRONOGRAMA DE PAGOS\n\n';
    
    csv += 'DATOS DEL CLIENTE\n';
    if (clientName) csv += `Nombre y Apellido / Razón Social;${clientName}\n`;
    if (clientDoc) csv += `Documento / CUIT;${clientDoc}\n`;
    if (clientAddress) csv += `Domicilio;${clientAddress}\n`;
    if (clientPhone) csv += `Teléfono;${clientPhone}\n`;
    if (clientEmail) csv += `Email;${clientEmail}\n`;
    csv += '\n';

    csv += 'PARÁMETROS DEL PRÉSTAMO\n';
    csv += `Capital;${getCurrencySymbol(currency)}${formatNumber(parseFloat(capital))}\n`;
    csv += `Cantidad de Períodos;${periods}\n`;
    csv += `TNA;${tna}%\n`;
    csv += `Sistema;${system.charAt(0).toUpperCase() + system.slice(1)}\n`;
    csv += `Periodicidad;${periodicity.charAt(0).toUpperCase() + periodicity.slice(1)}\n`;
    csv += `Fecha de Liquidación;${formatDate(liquidationDate)}\n`;
    if (system !== 'frances') {
      csv += `Fecha Primera Cuota;${formatDate(firstPaymentDate)}\n`;
    }
    csv += `Moneda;${currency}\n`;
    if (hasIVA) csv += `IVA;${ivaRate}%\n`;
    csv += '\n';

    csv += 'CRONOGRAMA DE PAGOS\n';
    csv += 'Cuota;Vencimiento;Días;Capital;Interés';
    if (hasIVA) csv += ';IVA';
    csv += ';Cuota Total;Saldo\n';

    schedule.forEach(row => {
      csv += `${row.period};${row.date};${row.days};${row.capital.toFixed(2)};${row.interest.toFixed(2)}`;
      if (hasIVA) csv += `;${row.iva.toFixed(2)}`;
      csv += `;${row.total.toFixed(2)};${row.balance.toFixed(2)}\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cronograma_${clientName || 'simulacion'}_${new Date().getTime()}.csv`;
    link.click();
  };

  // Exportar a PDF
  const exportToPDF = async () => {
    if (schedule.length === 0) {
      alert('Calcule el cronograma antes de exportar');
      return;
    }

    // Importar jsPDF dinámicamente
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Título principal
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CRONOGRAMA DE PAGOS', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Simulador de Préstamos', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Datos del cliente
    if (clientName || clientDoc || clientAddress || clientPhone || clientEmail) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL CLIENTE', 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (clientName) {
        doc.text(`Nombre y Apellido / Razón Social: ${clientName}`, 14, yPos);
        yPos += 5;
      }
      if (clientDoc) {
        doc.text(`Documento / CUIT: ${clientDoc}`, 14, yPos);
        yPos += 5;
      }
      if (clientAddress) {
        doc.text(`Domicilio: ${clientAddress}`, 14, yPos);
        yPos += 5;
      }
      if (clientPhone) {
        doc.text(`Teléfono: ${clientPhone}`, 14, yPos);
        yPos += 5;
      }
      if (clientEmail) {
        doc.text(`Email: ${clientEmail}`, 14, yPos);
        yPos += 5;
      }
      yPos += 5;
    }

    // Parámetros del préstamo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DEL PRÉSTAMO', 14, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Capital: ${getCurrencySymbol(currency)} ${formatNumber(parseFloat(capital))}`, 14, yPos);
    yPos += 5;
    doc.text(`Cantidad de Períodos: ${periods}`, 14, yPos);
    yPos += 5;
    doc.text(`TNA: ${tna}%`, 14, yPos);
    yPos += 5;
    doc.text(`Sistema: ${system.charAt(0).toUpperCase() + system.slice(1)}`, 14, yPos);
    yPos += 5;
    doc.text(`Periodicidad: ${periodicity.charAt(0).toUpperCase() + periodicity.slice(1)}`, 14, yPos);
    yPos += 5;
    doc.text(`Fecha de Liquidación: ${formatDate(liquidationDate)}`, 14, yPos);
    yPos += 5;
    if (system !== 'frances') {
      doc.text(`Fecha Primera Cuota: ${formatDate(firstPaymentDate)}`, 14, yPos);
      yPos += 5;
    }
    doc.text(`Moneda: ${currency}`, 14, yPos);
    yPos += 5;
    if (hasIVA) {
      doc.text(`IVA: ${ivaRate}%`, 14, yPos);
      yPos += 5;
    }
    yPos += 5;

    // Tabla del cronograma
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CRONOGRAMA DE PAGOS', 14, yPos);
    yPos += 5;

    const headers = hasIVA 
      ? [['Cuota', 'Vencimiento', 'Días', 'Capital', 'Interés', 'IVA', 'Total', 'Saldo']]
      : [['Cuota', 'Vencimiento', 'Días', 'Capital', 'Interés', 'Total', 'Saldo']];

    const data = schedule.map(row => {
      const baseRow = [
        row.period,
        row.date,
        row.days,
        formatNumber(row.capital),
        formatNumber(row.interest)
      ];
      
      if (hasIVA) {
        baseRow.push(formatNumber(row.iva));
      }
      
      baseRow.push(
        formatNumber(row.total),
        formatNumber(row.balance)
      );
      
      return baseRow;
    });

    doc.autoTable({
      startY: yPos,
      head: headers,
      body: data,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' }
      }
    });

    // Pie de página
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generado el: ${new Date().toLocaleString('es-AR')}`, pageWidth / 2, finalY, { align: 'center' });

    // Guardar PDF
    doc.save(`cronograma_${clientName || 'simulacion'}_${new Date().getTime()}.pdf`);
  };

  // Guardar simulación
  const saveSimulation = () => {
    if (schedule.length === 0) {
      alert('Calcule el cronograma antes de guardar');
      return;
    }

    const name = window.prompt('Nombre de la simulación:');
    if (!name) return;

    const simulation = {
      id: Date.now(),
      name,
      date: new Date().toISOString(),
      clientName,
      clientDoc,
      capital,
      periods,
      tna,
      system,
      currency,
      schedule,
      summary
    };

    const updated = [...savedSimulations, simulation];
    setSavedSimulations(updated);
    localStorage.setItem('savedSimulations', JSON.stringify(updated));
    alert('Simulación guardada correctamente');
  };

  // Cargar simulación
  const loadSimulation = (simulation) => {
    setClientName(simulation.clientName || '');
    setClientDoc(simulation.clientDoc || '');
    setCapital(simulation.capital || '');
    setPeriods(simulation.periods || '');
    setTna(simulation.tna || '');
    setSystem(simulation.system || 'frances');
    setCurrency(simulation.currency || 'ARS');
    setSchedule(simulation.schedule || []);
    setSummary(simulation.summary || null);
    setShowHistory(false);
  };

  // Eliminar simulación
  const deleteSimulation = (id) => {
    if (window.confirm('¿Eliminar esta simulación?')) {
      const updated = savedSimulations.filter(s => s.id !== id);
      setSavedSimulations(updated);
      localStorage.setItem('savedSimulations', JSON.stringify(updated));
    }
  };

  // Limpiar datos
  const clearData = () => {
    if (window.confirm('¿Limpiar todos los datos del formulario?')) {
      setClientName('');
      setClientDoc('');
      setClientAddress('');
      setClientPhone('');
      setClientEmail('');
      setCapital('');
      setPeriods('');
      setTna('');
      setSystem('frances');
      setPeriodicity('mensual');
      setLiquidationDate('');
      setFirstPaymentDate('');
      setCurrency('ARS');
      setIsManual(false);
      setManualCapitals([]);
      setGracePeriods(0);
      setGraceType('total');
      setHasIVA(false);
      setIvaRate(21);
      setSchedule([]);
      setSummary(null);
      alert('Datos limpiados correctamente');
    }
  };

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🧮</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Simulador de Préstamos</h1>
            <p className="text-gray-600">Inicia sesión para continuar</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@ejemplo.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Iniciar sesión
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Cuentas demo:</p>
            <p className="text-xs text-gray-500">admin@simulador.com / admin123</p>
            <p className="text-xs text-gray-500">usuario@demo.com / demo123</p>
            <p className="text-xs text-gray-500">test@test.com / test123</p>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla principal
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🧮 Simulador de Préstamos</h1>
              <p className="text-gray-600">Sistema profesional de cálculo financiero</p>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Datos del Cliente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Datos del Cliente</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre y Apellido / Razón Social
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Juan Pérez / Empresa S.A."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento / CUIT
                </label>
                <input
                  type="text"
                  value={clientDoc}
                  onChange={(e) => setClientDoc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="12345678 / 20-12345678-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domicilio</label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Calle 123, Ciudad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="cliente@email.com"
                />
              </div>
            </div>
          </div>

          {/* Parámetros del Préstamo */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Parámetros del Préstamo</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capital *</label>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="100000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Períodos *</label>
                <input
                  type="number"
                  value={periods}
                  onChange={(e) => setPeriods(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TNA (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={tna}
                  onChange={(e) => setTna(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="36"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sistema de Amortización *</label>
<select
  value={system}
  onChange={(e) => {
    const newSystem = e.target.value;
    setSystem(newSystem);
    setIsManual(false);
    setGracePeriods(0);
    // Si cambia a Francés, forzar periodicidad mensual
    if (newSystem === 'frances') {
      setPeriodicity('mensual');
    }
  }}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2"
>
                  <option value="frances">Francés</option>
                  <option value="aleman">Alemán</option>
                  <option value="americano">Americano</option>
                </select>
              </div>

              {system === 'aleman' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isManual}
                    onChange={(e) => {
                      setIsManual(e.target.checked);
                      if (!e.target.checked) setGracePeriods(0);
                    }}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700">Sistema Manual</label>
                </div>
              )}

              {system === 'aleman' && isManual && (
                <button
                  onClick={openManualModal}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Configurar Capitales Manualmente
                </button>
              )}

              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Periodicidad</label>
  <select
    value={periodicity}
    onChange={(e) => setPeriodicity(e.target.value)}
    disabled={system === 'frances'}
    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${
      system === 'frances' 
        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
        : 'border-gray-300'
    }`}
  >
    <option value="mensual">Mensual</option>
    <option value="bimestral">Bimestral</option>
    <option value="trimestral">Trimestral</option>
    <option value="cuatrimestral">Cuatrimestral</option>
    <option value="semestral">Semestral</option>
    <option value="anual">Anual</option>
  </select>
  {system === 'frances' && (
    <p className="text-xs text-gray-500 mt-1">
      ℹ️ Sistema Francés solo admite periodicidad mensual
    </p>
  )}
</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Liquidación *</label>
                <input
                  type="date"
                  value={liquidationDate}
                  onChange={(e) => setLiquidationDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {system !== 'frances' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Primera Cuota *</label>
                  <input
                    type="date"
                    value={firstPaymentDate}
                    onChange={(e) => setFirstPaymentDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {system === 'frances' && liquidationDate && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ℹ️ Primera cuota: {formatDate(addDays(new Date(liquidationDate), getDaysByPeriodicity(periodicity)))}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Días del primer período: {getDaysByPeriodicity(periodicity)} días
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ARS">Peso Argentino (ARS)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="SOJ">Soja (SOJ)</option>
                </select>
              </div>

              {system === 'aleman' && isManual && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Períodos de Gracia</label>
                    <input
                      type="number"
                      value={gracePeriods}
                      onChange={(e) => setGracePeriods(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  {gracePeriods > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Gracia</label>
                      <select
                        value={graceType}
                        onChange={(e) => setGraceType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="total">Total (no paga capital ni interés)</option>
                        <option value="parcial">Parcial (solo paga interés)</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={hasIVA}
                  onChange={(e) => setHasIVA(e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-700">Aplicar IVA sobre intereses</label>
              </div>

              {hasIVA && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tasa de IVA (%)</label>
                  <select
                    value={ivaRate}
                    onChange={(e) => setIvaRate(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="10.5">10.5%</option>
                    <option value="21">21%</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={calculateSchedule}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🧮 Calcular Cronograma
            </button>

            {schedule.length > 0 && (
              <>
                <button
                  onClick={exportToCSV}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  📊 Exportar CSV
                </button>

                <button
                  onClick={exportToPDF}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  📄 Exportar PDF
                </button>

                <button
                  onClick={saveSimulation}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  💾 Guardar
                </button>
              </>
            )}

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              📚 Historial
            </button>

            <button
              onClick={clearData}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              🗑️ Limpiar Datos
            </button>
          </div>
        </div>

        {/* Resumen */}
        {summary && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Resumen Financiero</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Capital Total</p>
                <p className="text-lg font-bold text-gray-800">{getCurrencySymbol(currency)} {formatNumber(summary.totalCapital)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Intereses Totales</p>
                <p className="text-lg font-bold text-blue-600">{getCurrencySymbol(currency)} {formatNumber(summary.totalInterest)}</p>
              </div>
              {summary.totalIVA > 0 && (
                <div>
                  <p className="text-sm text-gray-600">IVA Total</p>
                  <p className="text-lg font-bold text-orange-600">{getCurrencySymbol(currency)} {formatNumber(summary.totalIVA)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Total a Pagar</p>
                <p className="text-lg font-bold text-green-600">{getCurrencySymbol(currency)} {formatNumber(summary.totalAmount)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cronograma */}
        {schedule.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📅 Cronograma de Pagos</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Cuota</th>
                    <th className="p-3 text-left">Vencimiento</th>
                    <th className="p-3 text-right">Días</th>
                    <th className="p-3 text-right">Capital</th>
                    <th className="p-3 text-right">Interés</th>
                    {hasIVA && <th className="p-3 text-right">IVA</th>}
                    <th className="p-3 text-right">Cuota Total</th>
                    <th className="p-3 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`border-b ${row.isGrace ? 'bg-yellow-50' : ''}`}
                    >
                      <td className="p-3">
                        {row.period}
                        {row.isGrace && <span className="ml-2 text-xs text-yellow-600">(Gracia)</span>}
                      </td>
                      <td className="p-3">{row.date}</td>
                      <td className="p-3 text-right">{row.days}</td>
                      <td className="p-3 text-right">{formatNumber(row.capital)}</td>
                      <td className="p-3 text-right">{formatNumber(row.interest)}</td>
                      {hasIVA && <td className="p-3 text-right">{formatNumber(row.iva)}</td>}
                      <td className="p-3 text-right font-medium">{formatNumber(row.total)}</td>
                      <td className="p-3 text-right text-gray-600">{formatNumber(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Historial */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">📚 Simulaciones Guardadas</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {savedSimulations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay simulaciones guardadas</p>
              ) : (
                <div className="space-y-4">
                  {savedSimulations.map((sim) => (
                    <div key={sim.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-800">{sim.name}</h3>
                          <p className="text-sm text-gray-600">
                            {sim.clientName || 'Sin cliente'} | {getCurrencySymbol(sim.currency)} {formatNumber(parseFloat(sim.capital))} | {sim.periods} períodos
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(sim.date).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => loadSimulation(sim)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Cargar
                          </button>
                          <button
                            onClick={() => deleteSimulation(sim.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Sistema Manual */}
        {showManualModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Configuración Manual de Capitales</h2>
              
              <div className="mb-4">
                <button
                  onClick={distributeEvenly}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Distribuir Parejo
                </button>
              </div>

              <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                {manualCapitals.map((cap, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <span className="w-20 text-sm font-medium">Cuota {index + 1}:</span>
                    <input
                      type="number"
                      value={cap}
                      onChange={(e) => updateManualCapital(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      disabled={index < gracePeriods}
                    />
                    {index < gracePeriods && (
                      <span className="text-xs text-yellow-600">(Período de gracia)</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm">
                  <strong>Total asignado:</strong> {formatNumber(manualCapitals.reduce((sum, val) => sum + val, 0))}
                </p>
                <p className="text-sm">
                  <strong>Capital del préstamo:</strong> {formatNumber(parseFloat(capital))}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={saveManualCapitals}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

