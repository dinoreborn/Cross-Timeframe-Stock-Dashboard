import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, Eye, List, Calendar, Clock, RotateCcw, BarChart3, Flame, TrendingDown, Download, RefreshCw, X } from 'lucide-react';

const CrossTimeframeStockDashboard = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [minReturn, setMinReturn] = useState(0);
  const [minAppearances, setMinAppearances] = useState(1);
  const [sortBy, setSortBy] = useState('avgReturn');
  const [view, setView] = useState('heatmap');
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [showCrossTimeframe, setShowCrossTimeframe] = useState(false);
  const [showSectorAnalysis, setShowSectorAnalysis] = useState(false);
  const [sectorTimeframe, setSectorTimeframe] = useState('cross');

  // Load data from separate JSON files on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load monthly data
        const monthlyResponse = await fetch('/data/monthly.json');
        if (monthlyResponse.ok) {
          const monthlyJson = await monthlyResponse.json();
          setMonthlyData(monthlyJson.monthly || monthlyJson || []); // Handle both nested and direct array
        }

        // Load quarterly data
        const quarterlyResponse = await fetch('/data/quarterly.json');
        if (quarterlyResponse.ok) {
          const quarterlyJson = await quarterlyResponse.json();
          setQuarterlyData(quarterlyJson.quarterly || quarterlyJson || []);
        }

        // Load yearly data
        const yearlyResponse = await fetch('/data/yearly.json');
        if (yearlyResponse.ok) {
          const yearlyJson = await yearlyResponse.json();
          setYearlyData(yearlyJson.yearly || yearlyJson || []); // This will extract the "yearly" array
        }

        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading data files:', error);
        setMonthlyData([]);
        setQuarterlyData([]);
        setYearlyData([]);
        setDataLoaded(true);
      }
    };

    if (!dataLoaded) {
      loadData();
    }
  }, [dataLoaded]);

  const loadDefaultData = async () => {
    try {
      // Reload data from JSON files
      const monthlyResponse = await fetch('/data/monthly.json');
      if (monthlyResponse.ok) {
        const monthlyJson = await monthlyResponse.json();
        setMonthlyData(monthlyJson.monthly || monthlyJson || []);
      }

      const quarterlyResponse = await fetch('/data/quarterly.json');
      if (quarterlyResponse.ok) {
        const quarterlyJson = await quarterlyResponse.json();
        setQuarterlyData(quarterlyJson.quarterly || quarterlyJson || []);
      }

      const yearlyResponse = await fetch('/data/yearly.json');
      if (yearlyResponse.ok) {
        const yearlyJson = await yearlyResponse.json();
        setYearlyData(yearlyJson.yearly || yearlyJson || []);
      }

      alert('Data reloaded from JSON files');
    } catch (error) {
      console.error('Error reloading data:', error);
      alert('Error loading data files');
    }
  };

  const formatReturn = (returnValue) => {
    return `${returnValue.toFixed(1)}%`;
  };

  const getReturnColor = (returnValue) => {
    if (returnValue >= 80) return 'bg-green-600';
    if (returnValue >= 60) return 'bg-green-500';
    if (returnValue >= 40) return 'bg-green-400';
    if (returnValue >= 20) return 'bg-green-300';
    if (returnValue >= 10) return 'bg-yellow-300';
    if (returnValue >= 0) return 'bg-yellow-200';
    return 'bg-red-300';
  };

  const getReturnTextColor = (returnValue) => {
    if (returnValue >= 40) return 'text-white';
    if (returnValue >= 0) return 'text-gray-800';
    return 'text-white';
  };

  const getSectorColor = (sector) => {
    const colors = [
      'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100',
      'bg-pink-100', 'bg-indigo-100', 'bg-red-100', 'bg-orange-100'
    ];
    const index = Math.abs(sector.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length;
    return colors[index];
  };

  const processData = (rawData) => {
    const stocksByPeriod = {};
    const allStocks = new Set();
    const stockInfo = {};
    const sectors = new Set();
    const indices = new Set();
    const stockReturns = {};

    rawData.forEach(item => {
      const { period, stock, sector, index, returns } = item;

      if (!stocksByPeriod[period]) {
        stocksByPeriod[period] = {};
      }

      stocksByPeriod[period][stock] = returns;
      allStocks.add(stock);

      stockInfo[stock] = { sector, index };
      sectors.add(sector);
      indices.add(index);

      if (!stockReturns[stock]) {
        stockReturns[stock] = [];
      }
      stockReturns[stock].push({ period, return: returns });
    });

    const stocksArray = Array.from(allStocks).sort();

    const sortPeriods = (periods) => {
      return periods.sort((a, b) => {
        const monthMap = {
          'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
          'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        };

        const getDateFromPeriod = (period) => {
          const format1 = period.match(/^(\w{3})-(\d{2})$/);
          if (format1) {
            const year = 2000 + parseInt(format1[2]);
            const month = monthMap[format1[1]];
            return new Date(year, month - 1);
          }

          const format2 = period.match(/^(\d{2})-(\w{3})$/);
          if (format2) {
            const year = 2000 + parseInt(format2[1]);
            const month = monthMap[format2[2]];
            return new Date(year, month - 1);
          }

          const format3 = period.match(/^Q(\d)\s(\d{4})$/);
          if (format3) {
            const year = parseInt(format3[2]);
            const quarter = parseInt(format3[1]);
            const month = (quarter - 1) * 3;
            return new Date(year, month);
          }

          return new Date(period);
        };

        const dateA = getDateFromPeriod(a);
        const dateB = getDateFromPeriod(b);

        if (dateA && dateB && !isNaN(dateA) && !isNaN(dateB)) {
          return dateA - dateB;
        }

        return a.localeCompare(b);
      });
    };

    const periods = sortPeriods(Object.keys(stocksByPeriod));

    const matrix = stocksArray.map(stock => {
      const row = { stock };
      periods.forEach(period => {
        row[period] = stocksByPeriod[period]?.[stock] || null;
      });
      return row;
    });

    const stockStats = stocksArray.map(stock => {
      const returns = stockReturns[stock] || [];
      const validReturns = returns.filter(r => r.return !== null && r.return !== undefined);
      const appearances = validReturns.length;
      const avgReturn = appearances > 0 ? validReturns.reduce((sum, r) => sum + r.return, 0) / appearances : 0;
      const maxReturn = appearances > 0 ? Math.max(...validReturns.map(r => r.return)) : 0;
      const periodsAppeared = validReturns.map(r => r.period);

      return {
        stock,
        appearances,
        avgReturn,
        maxReturn,
        periodsAppeared,
        sector: stockInfo[stock]?.sector || 'Unknown',
        index: stockInfo[stock]?.index || 'Unknown',
        returns: validReturns
      };
    });

    return {
      matrix,
      periods,
      stockStats,
      sectors: Array.from(sectors),
      indices: Array.from(indices)
    };
  };

  // ... (rest of the helper functions remain the same as in the original code)
  const getStockDetails = (stockName) => {
    const monthlyProcessed = processData(monthlyData);
    const quarterlyProcessed = processData(quarterlyData);
    const yearlyProcessed = processData(yearlyData);

    const monthlyStock = monthlyProcessed.stockStats.find(s => s.stock === stockName);
    const quarterlyStock = quarterlyProcessed.stockStats.find(s => s.stock === stockName);
    const yearlyStock = yearlyProcessed.stockStats.find(s => s.stock === stockName);

    const allAppearances = [];

    if (monthlyStock) {
      monthlyStock.returns.forEach(ret => {
        allAppearances.push({
          timeframe: 'Monthly',
          period: ret.period,
          return: ret.return
        });
      });
    }

    if (quarterlyStock) {
      quarterlyStock.returns.forEach(ret => {
        allAppearances.push({
          timeframe: 'Quarterly',
          period: ret.period,
          return: ret.return
        });
      });
    }

    if (yearlyStock) {
      yearlyStock.returns.forEach(ret => {
        allAppearances.push({
          timeframe: 'Yearly',
          period: ret.period,
          return: ret.return
        });
      });
    }

    const totalAppearances = allAppearances.length;
    const overallAvgReturn = totalAppearances > 0 ?
      allAppearances.reduce((sum, app) => sum + app.return, 0) / totalAppearances : 0;
    const overallMaxReturn = totalAppearances > 0 ?
      Math.max(...allAppearances.map(app => app.return)) : 0;

    return {
      stock: stockName,
      sector: monthlyStock?.sector || quarterlyStock?.sector || yearlyStock?.sector || 'Unknown',
      totalAppearances,
      overallAvgReturn,
      overallMaxReturn,
      monthlyAvgReturn: monthlyStock?.avgReturn || null,
      quarterlyAvgReturn: quarterlyStock?.avgReturn || null,
      yearlyAvgReturn: yearlyStock?.avgReturn || null,
      monthlyAppearances: monthlyStock?.appearances || 0,
      quarterlyAppearances: quarterlyStock?.appearances || 0,
      yearlyAppearances: yearlyStock?.appearances || 0,
      allAppearances: allAppearances.sort((a, b) => {
        const timeframePriority = { 'Monthly': 1, 'Quarterly': 2, 'Yearly': 3 };
        if (timeframePriority[a.timeframe] !== timeframePriority[b.timeframe]) {
          return timeframePriority[a.timeframe] - timeframePriority[b.timeframe];
        }
        return a.period.localeCompare(b.period);
      })
    };
  };

  const getSectorDetails = (sectorName) => {
    const monthlyProcessed = processData(monthlyData);
    const quarterlyProcessed = processData(quarterlyData);
    const yearlyProcessed = processData(yearlyData);

    const monthlyStocks = monthlyProcessed.stockStats.filter(s => s.sector === sectorName);
    const quarterlyStocks = quarterlyProcessed.stockStats.filter(s => s.sector === sectorName);
    const yearlyStocks = yearlyProcessed.stockStats.filter(s => s.sector === sectorName);

    const allAppearances = [];

    monthlyStocks.forEach(stock => {
      stock.returns.forEach(ret => {
        allAppearances.push({
          timeframe: 'Monthly',
          period: ret.period,
          return: ret.return,
          stock: stock.stock
        });
      });
    });

    quarterlyStocks.forEach(stock => {
      stock.returns.forEach(ret => {
        allAppearances.push({
          timeframe: 'Quarterly',
          period: ret.period,
          return: ret.return,
          stock: stock.stock
        });
      });
    });

    yearlyStocks.forEach(stock => {
      stock.returns.forEach(ret => {
        allAppearances.push({
          timeframe: 'Yearly',
          period: ret.period,
          return: ret.return,
          stock: stock.stock
        });
      });
    });

    const totalAppearances = allAppearances.length;
    const overallAvgReturn = totalAppearances > 0 ?
      allAppearances.reduce((sum, app) => sum + app.return, 0) / totalAppearances : 0;
    const overallMaxReturn = totalAppearances > 0 ?
      Math.max(...allAppearances.map(app => app.return)) : 0;

    const monthlyReturns = allAppearances.filter(app => app.timeframe === 'Monthly').map(app => app.return);
    const quarterlyReturns = allAppearances.filter(app => app.timeframe === 'Quarterly').map(app => app.return);
    const yearlyReturns = allAppearances.filter(app => app.timeframe === 'Yearly').map(app => app.return);

    const monthlyAvgReturn = monthlyReturns.length > 0 ?
      monthlyReturns.reduce((sum, ret) => sum + ret, 0) / monthlyReturns.length : null;
    const quarterlyAvgReturn = quarterlyReturns.length > 0 ?
      quarterlyReturns.reduce((sum, ret) => sum + ret, 0) / quarterlyReturns.length : null;
    const yearlyAvgReturn = yearlyReturns.length > 0 ?
      yearlyReturns.reduce((sum, ret) => sum + ret, 0) / yearlyReturns.length : null;

    const uniqueStocks = new Set([
      ...monthlyStocks.map(s => s.stock),
      ...quarterlyStocks.map(s => s.stock),
      ...yearlyStocks.map(s => s.stock)
    ]);

    return {
      sector: sectorName,
      totalAppearances,
      overallAvgReturn,
      overallMaxReturn,
      monthlyAvgReturn,
      quarterlyAvgReturn,
      yearlyAvgReturn,
      monthlyAppearances: monthlyReturns.length,
      quarterlyAppearances: quarterlyReturns.length,
      yearlyAppearances: yearlyReturns.length,
      stockCount: uniqueStocks.size,
      stocks: Array.from(uniqueStocks),
      allAppearances: allAppearances.sort((a, b) => {
        const timeframePriority = { 'Monthly': 1, 'Quarterly': 2, 'Yearly': 3 };
        if (timeframePriority[a.timeframe] !== timeframePriority[b.timeframe]) {
          return timeframePriority[a.timeframe] - timeframePriority[b.timeframe];
        }
        return a.period.localeCompare(b.period);
      })
    };
  };

  const currentData = useMemo(() => {
    const rawData = timeFrame === 'monthly' ? monthlyData :
      timeFrame === 'quarterly' ? quarterlyData : yearlyData;
    return processData(rawData);
  }, [monthlyData, quarterlyData, yearlyData, timeFrame]);

  const crossTimeframeData = useMemo(() => {
    const monthlyProcessed = processData(monthlyData);
    const quarterlyProcessed = processData(quarterlyData);
    const yearlyProcessed = processData(yearlyData);

    const allStocks = new Set([
      ...monthlyProcessed.stockStats.map(s => s.stock),
      ...quarterlyProcessed.stockStats.map(s => s.stock),
      ...yearlyProcessed.stockStats.map(s => s.stock)
    ]);

    return Array.from(allStocks).map(stock => {
      const monthlyStock = monthlyProcessed.stockStats.find(s => s.stock === stock);
      const quarterlyStock = quarterlyProcessed.stockStats.find(s => s.stock === stock);
      const yearlyStock = yearlyProcessed.stockStats.find(s => s.stock === stock);

      const timeframes = [];
      if (monthlyStock) timeframes.push('Monthly');
      if (quarterlyStock) timeframes.push('Quarterly');
      if (yearlyStock) timeframes.push('Yearly');

      const returns = [
        monthlyStock?.avgReturn,
        quarterlyStock?.avgReturn,
        yearlyStock?.avgReturn
      ].filter(Boolean);

      const avgReturn = returns.length > 0 ? returns.reduce((sum, val) => sum + val, 0) / returns.length : 0;
      const maxReturn = Math.max(...[
        monthlyStock?.maxReturn || 0,
        quarterlyStock?.maxReturn || 0,
        yearlyStock?.maxReturn || 0
      ]);

      return {
        stock,
        timeframes,
        totalTimeframes: timeframes.length,
        sector: monthlyStock?.sector || quarterlyStock?.sector || yearlyStock?.sector || 'Unknown',
        avgReturn,
        maxReturn
      };
    }).sort((a, b) => {
      if (b.totalTimeframes !== a.totalTimeframes) return b.totalTimeframes - a.totalTimeframes;
      return b.avgReturn - a.avgReturn;
    });
  }, [monthlyData, quarterlyData, yearlyData]);

  const sectorAnalysis = useMemo(() => {
    const monthlyProcessed = processData(monthlyData);
    const quarterlyProcessed = processData(quarterlyData);
    const yearlyProcessed = processData(yearlyData);

    const combinedSectorMap = new Map();

    const processTimeframe = (data, timeframe) => {
      data.stockStats.forEach(stock => {
        const sector = stock.sector;
        if (!combinedSectorMap.has(sector)) {
          combinedSectorMap.set(sector, {
            sector,
            returns: [],
            timeframes: new Set(),
            monthlyReturns: [],
            quarterlyReturns: [],
            yearlyReturns: []
          });
        }
        const sectorData = combinedSectorMap.get(sector);
        sectorData.returns.push(...stock.returns.map(r => r.return));
        sectorData.timeframes.add(timeframe);

        if (timeframe === 'Monthly') {
          sectorData.monthlyReturns.push(...stock.returns.map(r => r.return));
        } else if (timeframe === 'Quarterly') {
          sectorData.quarterlyReturns.push(...stock.returns.map(r => r.return));
        } else if (timeframe === 'Yearly') {
          sectorData.yearlyReturns.push(...stock.returns.map(r => r.return));
        }
      });
    };

    processTimeframe(monthlyProcessed, 'Monthly');
    processTimeframe(quarterlyProcessed, 'Quarterly');
    processTimeframe(yearlyProcessed, 'Yearly');

    const createTimeframeAnalysis = (data, timeframeName) => {
      const sectorMap = new Map();

      data.stockStats.forEach(stock => {
        const sector = stock.sector;
        if (!sectorMap.has(sector)) {
          sectorMap.set(sector, { sector, returns: [] });
        }
        sectorMap.get(sector).returns.push(...stock.returns.map(r => r.return));
      });

      return Array.from(sectorMap.values()).map(sectorData => {
        const avgReturn = sectorData.returns.reduce((sum, r) => sum + r, 0) / sectorData.returns.length;
        const maxReturn = Math.max(...sectorData.returns);

        let status = 'Stable';
        let statusColor = 'bg-gray-100 text-gray-800';

        if (avgReturn >= 60) {
          status = 'Hot 🔥';
          statusColor = 'bg-red-100 text-red-800 border-red-300';
        } else if (avgReturn >= 40) {
          status = 'Emerging 📈';
          statusColor = 'bg-green-100 text-green-800 border-green-300';
        } else if (avgReturn >= 20) {
          status = 'Cooling 📉';
          statusColor = 'bg-blue-100 text-blue-800 border-blue-300';
        }

        return {
          sector: sectorData.sector,
          overallAvgReturn: avgReturn,
          maxReturn,
          status,
          statusColor,
          timeframe: timeframeName
        };
      }).sort((a, b) => b.overallAvgReturn - a.overallAvgReturn);
    };

    const crossSectorAnalysis = Array.from(combinedSectorMap.values()).map(sectorData => {
      const avgReturn = sectorData.returns.reduce((sum, r) => sum + r, 0) / sectorData.returns.length;
      const maxReturn = Math.max(...sectorData.returns);

      let status = 'Stable';
      let statusColor = 'bg-gray-100 text-gray-800';

      if (avgReturn >= 60) {
        status = 'Hot 🔥';
        statusColor = 'bg-red-100 text-red-800 border-red-300';
      } else if (avgReturn >= 40) {
        status = 'Emerging 📈';
        statusColor = 'bg-green-100 text-green-800 border-green-300';
      } else if (avgReturn >= 20) {
        status = 'Cooling 📉';
        statusColor = 'bg-blue-100 text-blue-800 border-blue-300';
      }

      const monthlyAvg = sectorData.monthlyReturns.length > 0 ?
        sectorData.monthlyReturns.reduce((sum, r) => sum + r, 0) / sectorData.monthlyReturns.length : null;
      const quarterlyAvg = sectorData.quarterlyReturns.length > 0 ?
        sectorData.quarterlyReturns.reduce((sum, r) => sum + r, 0) / sectorData.quarterlyReturns.length : null;
      const yearlyAvg = sectorData.yearlyReturns.length > 0 ?
        sectorData.yearlyReturns.reduce((sum, r) => sum + r, 0) / sectorData.yearlyReturns.length : null;

      return {
        sector: sectorData.sector,
        overallAvgReturn: avgReturn,
        maxReturn,
        status,
        statusColor,
        timeframes: Array.from(sectorData.timeframes),
        monthlyAvg,
        quarterlyAvg,
        yearlyAvg,
        totalTimeframes: sectorData.timeframes.size
      };
    }).sort((a, b) => b.overallAvgReturn - a.overallAvgReturn);

    return {
      crossTimeframe: crossSectorAnalysis,
      monthly: createTimeframeAnalysis(monthlyProcessed, 'Monthly'),
      quarterly: createTimeframeAnalysis(quarterlyProcessed, 'Quarterly'),
      yearly: createTimeframeAnalysis(yearlyProcessed, 'Yearly'),
      hotSectors: crossSectorAnalysis.filter(s => s.status === 'Hot 🔥'),
      emergingSectors: crossSectorAnalysis.filter(s => s.status === 'Emerging 📈'),
      coolingSectors: crossSectorAnalysis.filter(s => s.status === 'Cooling 📉')
    };
  }, [monthlyData, quarterlyData, yearlyData]);

  const filteredStocks = useMemo(() => {
    if (showSectorAnalysis) {
      const sectorData = sectorTimeframe === 'cross' ? sectorAnalysis.crossTimeframe :
        sectorTimeframe === 'monthly' ? sectorAnalysis.monthly :
          sectorTimeframe === 'quarterly' ? sectorAnalysis.quarterly :
            sectorAnalysis.yearly;

      return sectorData.filter(sector =>
        sector.sector.toLowerCase().includes(searchTerm.toLowerCase()) &&
        sector.overallAvgReturn >= minReturn
      );
    }

    if (showCrossTimeframe) {
      return crossTimeframeData.filter(stock =>
        stock.stock.toLowerCase().includes(searchTerm.toLowerCase()) &&
        stock.totalTimeframes >= minAppearances &&
        stock.avgReturn >= minReturn
      );
    }

    let filtered = currentData.stockStats.filter(stock =>
      stock.stock.toLowerCase().includes(searchTerm.toLowerCase()) &&
      stock.appearances >= minAppearances &&
      stock.avgReturn >= minReturn
    );

    if (sortBy === 'avgReturn') {
      filtered = filtered.sort((a, b) => b.avgReturn - a.avgReturn);
    } else if (sortBy === 'maxReturn') {
      filtered = filtered.sort((a, b) => b.maxReturn - a.maxReturn);
    } else if (sortBy === 'consistency') {
      filtered = filtered.sort((a, b) => b.appearances - a.appearances);
    }

    return filtered;
  }, [currentData, crossTimeframeData, sectorAnalysis, searchTerm, minAppearances, minReturn, sortBy, showSectorAnalysis, showCrossTimeframe, sectorTimeframe]);

  // Helper function to remove whitespace from stock names
  const sanitizeStockName = (stockName) => {
    return stockName.replace(/\s+/g, '');
  };

  // Helper function to convert array to CSV string
  const arrayToCSV = (data) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  };

  const exportCurrentData = () => {
    const data = timeFrame === 'monthly' ? monthlyData :
      timeFrame === 'quarterly' ? quarterlyData : yearlyData;

    const csvData = data.map(item => ({
      period: item.period,
      stock: sanitizeStockName(item.stock),
      sector: item.sector,
      index: item.index,
      returns: item.returns
    }));

    const csvString = arrayToCSV(csvData);
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${timeFrame}-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAllData = () => {
    const allCombinedData = [
      ...monthlyData.map(item => ({ ...item, timeframe: 'Monthly', stock: sanitizeStockName(item.stock) })),
      ...quarterlyData.map(item => ({ ...item, timeframe: 'Quarterly', stock: sanitizeStockName(item.stock) })),
      ...yearlyData.map(item => ({ ...item, timeframe: 'Yearly', stock: sanitizeStockName(item.stock) }))
    ];

    const csvData = allCombinedData.map(item => ({
      timeframe: item.timeframe,
      period: item.period,
      stock: item.stock,
      sector: item.sector,
      index: item.index,
      returns: item.returns
    }));

    const csvString = arrayToCSV(csvData);
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `stock-dashboard-complete-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export unique stocks excluding F&O (uses your sanitize/process helpers)
  const exportNonFnoUniqueStocks = async () => {
    try {
      const fnoResp = await fetch('/data/fno.json'); // <-- capitalized
      const fnoList = fnoResp.ok ? await fnoResp.json() : [];
      const fnoSet = new Set((fnoList || []).map(s => sanitizeStockName(s)));

      const monthlyProcessed = processData(monthlyData);
      const quarterlyProcessed = processData(quarterlyData);
      const yearlyProcessed = processData(yearlyData);
      const allUniqueStocks = new Set([
        ...monthlyProcessed.stockStats.map(s => sanitizeStockName(s.stock)),
        ...quarterlyProcessed.stockStats.map(s => sanitizeStockName(s.stock)),
        ...yearlyProcessed.stockStats.map(s => sanitizeStockName(s.stock))
      ]);

      const nonFnoStocks = Array.from(allUniqueStocks).filter(s => !fnoSet.has(s)).sort();

      if (nonFnoStocks.length === 0) {
        console.log('No non-F&O stocks found to export.');
        return;
      }

      const csvData = nonFnoStocks.map(stock => ({ stock }));
      const csvString = arrayToCSV(csvData);
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `non-fno-unique-stocks-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`Exported ${nonFnoStocks.length} non-F&O unique stocks.`);
    } catch (err) {
      console.error('Error exporting non-F&O stocks:', err);
    }
  };

  const exportUniqueIpoNonFnoStocks = async () => {
    try {
      const [fnoResp, ipoResp] = await Promise.all([
        fetch('/data/fno.json'), // <-- capitalized
        fetch('/data/ipo.json')  // <-- capitalized
      ]);
      const fnoList = fnoResp.ok ? await fnoResp.json() : [];
      const ipoList = ipoResp.ok ? await ipoResp.json() : [];

      const fnoSet = new Set((fnoList || []).map(s => sanitizeStockName(s)));
      const ipoSet = new Set((ipoList || []).map(s => sanitizeStockName(s)));

      const monthlyProcessed = processData(monthlyData);
      const quarterlyProcessed = processData(quarterlyData);
      const yearlyProcessed = processData(yearlyData);

      const allUniqueStocks = new Set([
        ...monthlyProcessed.stockStats.map(s => sanitizeStockName(s.stock)),
        ...quarterlyProcessed.stockStats.map(s => sanitizeStockName(s.stock)),
        ...yearlyProcessed.stockStats.map(s => sanitizeStockName(s.stock))
      ]);

      const nonFnoFromData = Array.from(allUniqueStocks).filter(s => !fnoSet.has(s));
      const ipoNonFno = nonFnoFromData.filter(s => ipoSet.has(s)).sort();

      if (ipoNonFno.length === 0) {
        console.log('No IPO (non-F&O) stocks found to export.');
        return;
      }

      const csvData = ipoNonFno.map(stock => ({ stock }));
      const csvString = arrayToCSV(csvData);
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ipo-non-fno-unique-stocks-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`Exported ${ipoNonFno.length} IPO non-F&O unique stocks.`);
    } catch (err) {
      console.error('Error exporting IPO non-F&O stocks:', err);
    }
  };


  const exportUniqueStocks = () => {
    const monthlyProcessed = processData(monthlyData);
    const quarterlyProcessed = processData(quarterlyData);
    const yearlyProcessed = processData(yearlyData);

    const allUniqueStocks = new Set([
      ...monthlyProcessed.stockStats.map(s => s.stock),
      ...quarterlyProcessed.stockStats.map(s => s.stock),
      ...yearlyProcessed.stockStats.map(s => s.stock)
    ]);

    // Create a simple CSV with just stock names (no whitespace)
    const stockNames = Array.from(allUniqueStocks)
      .map(stock => sanitizeStockName(stock))
      .sort();

    const csvData = stockNames.map(stock => ({ stock }));
    const csvString = arrayToCSV(csvData);

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `unique-stocks-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 text-gray-800">Cross-Timeframe Stock Performance Dashboard</h1>
        <p className="text-lg text-gray-600">Analyze stock returns and sector trends across multiple timeframes</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['monthly', 'quarterly', 'yearly', 'cross-timeframe'].map(frame => (
          <button
            key={frame}
            onClick={() => {
              if (frame === 'cross-timeframe') {
                setShowCrossTimeframe(true);
                setShowSectorAnalysis(false);
              } else {
                setTimeFrame(frame);
                setShowCrossTimeframe(false);
                setShowSectorAnalysis(false);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-md ${(frame === 'cross-timeframe' && showCrossTimeframe) || (frame === timeFrame && !showCrossTimeframe)
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
          >
            {frame === 'monthly' && <Calendar size={16} />}
            {frame === 'quarterly' && <Clock size={16} />}
            {frame === 'yearly' && <RotateCcw size={16} />}
            {frame === 'cross-timeframe' && <TrendingUp size={16} />}
            <span className="capitalize font-medium">
              {frame === 'cross-timeframe' ? 'Cross-Timeframe' : frame}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <select
              onChange={async (e) => {
                const value = e.target.value;
                try {
                  if (value === 'current') exportCurrentData();
                  else if (value === 'all') exportAllData();
                  else if (value === 'stocks') exportUniqueStocks();
                  else if (value === 'nonfno') await exportNonFnoUniqueStocks();
                  else if (value === 'ipo_nonfno') await exportUniqueIpoNonFnoStocks();
                } finally {
                  e.target.value = ''; // reset
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer"
            >
              <option value="">📥 Export CSV Options</option>
              <option value="current">Export Current Timeframe</option>
              <option value="all">Export All Timeframes</option>
              <option value="stocks">Export Stock Names Only</option>
              <option value="nonfno">Export Non F&O Unique Stocks</option>
              <option value="ipo_nonfno">Export Unique IPO Non-F&O Stocks</option>
            </select>

          </div>

          <button
            onClick={loadDefaultData}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            <RefreshCw size={16} />
            Reload Data
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setView('heatmap');
                setShowSectorAnalysis(false);
                setShowCrossTimeframe(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded ${view === 'heatmap' && !showSectorAnalysis && !showCrossTimeframe ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <Eye size={16} />
              Heat Map
            </button>
            <button
              onClick={() => {
                setView('list');
                setShowSectorAnalysis(false);
                setShowCrossTimeframe(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded ${view === 'list' && !showSectorAnalysis && !showCrossTimeframe ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              <List size={16} />
              List View
            </button>
            <button
              onClick={() => {
                setShowSectorAnalysis(!showSectorAnalysis);
                if (!showSectorAnalysis) {
                  setShowCrossTimeframe(false);
                }
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded ${showSectorAnalysis ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
            >
              <BarChart3 size={16} />
              Sector Analysis
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={showSectorAnalysis ? "Search sectors..." : "Search stocks..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <input
            type="number"
            placeholder="Min return %"
            value={minReturn || ''}
            onChange={(e) => setMinReturn(parseFloat(e.target.value) || 0)}
            className="px-3 py-2 border rounded-lg"
          />
          <select
            value={minAppearances}
            onChange={(e) => setMinAppearances(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            {showCrossTimeframe ? (
              <>
                <option value={1}>All stocks</option>
                <option value={2}>2+ timeframes</option>
                <option value={3}>All 3 timeframes</option>
              </>
            ) : (
              <>
                <option value={1}>All stocks</option>
                <option value={2}>2+ appearances</option>
                <option value={3}>3+ appearances</option>
              </>
            )}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="avgReturn">Sort by Avg Return</option>
            <option value="maxReturn">Sort by Max Return</option>
            <option value="consistency">Sort by Consistency</option>
          </select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{currentData.periods.length}</div>
          <div className="text-sm text-gray-600">Periods</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{currentData.stockStats.length}</div>
          <div className="text-sm text-gray-600">Stocks</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{filteredStocks.length}</div>
          <div className="text-sm text-gray-600">Filtered</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {currentData.stockStats.length > 0 ? formatReturn(Math.max(...currentData.stockStats.map(s => s.maxReturn))) : '0.0%'}
          </div>
          <div className="text-sm text-gray-600">Best Return</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {showCrossTimeframe && !showSectorAnalysis ? (
          <div className="p-4">
            <h3 className="text-xl font-bold mb-4">Cross-Timeframe Analysis</h3>
            <div className="space-y-3">
              {filteredStocks.map((stock) => (
                <div
                  key={stock.stock}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedStock(stock.stock)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg">{stock.stock}</div>
                      <div className="text-sm text-gray-600">{stock.sector}</div>
                      <div className="text-sm">Timeframes: {stock.timeframes.join(', ')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">{formatReturn(stock.avgReturn)}</div>
                      <div className="text-sm text-orange-600">Max: {formatReturn(stock.maxReturn)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : showSectorAnalysis ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Sector Analysis</h3>
              <div className="flex gap-2">
                {['cross', 'monthly', 'quarterly', 'yearly'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setSectorTimeframe(tf)}
                    className={`px-3 py-1 rounded text-sm ${sectorTimeframe === tf ? 'bg-orange-500 text-white' : 'bg-gray-200'
                      }`}
                  >
                    {tf === 'cross' ? 'Cross-TF' : tf.charAt(0).toUpperCase() + tf.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="text-red-600" size={20} />
                  <span className="font-semibold text-red-800">Hot Sectors</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {sectorTimeframe === 'cross' ? sectorAnalysis.hotSectors.length :
                    filteredStocks.filter(s => s.status === 'Hot 🔥').length}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-green-600" size={20} />
                  <span className="font-semibold text-green-800">Emerging</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {sectorTimeframe === 'cross' ? sectorAnalysis.emergingSectors.length :
                    filteredStocks.filter(s => s.status === 'Emerging 📈').length}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="text-blue-600" size={20} />
                  <span className="font-semibold text-blue-800">Cooling</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {sectorTimeframe === 'cross' ? sectorAnalysis.coolingSectors.length :
                    filteredStocks.filter(s => s.status === 'Cooling 📉').length}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {filteredStocks.map((sector) => (
                <div
                  key={sector.sector}
                  className="p-4 border rounded-lg hover:bg-orange-50 cursor-pointer"
                  onClick={() => setSelectedStock(sector.sector)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-lg">{sector.sector}</div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${sector.statusColor}`}>
                          {sector.status}
                        </span>
                        {sectorTimeframe === 'cross' && sector.timeframes && (
                          <span className="text-xs text-gray-600">
                            ({sector.timeframes.join(', ')})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">{formatReturn(sector.overallAvgReturn)}</div>
                      <div className="text-sm text-orange-600">Max: {formatReturn(sector.maxReturn)}</div>
                      {sectorTimeframe === 'cross' && (
                        <div className="text-xs text-gray-600">
                          {sector.totalTimeframes}/3 timeframes
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : view === 'heatmap' ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Sector</th>
                  {currentData.periods.map(period => (
                    <th key={period} className="text-center p-3 text-xs">{period}</th>
                  ))}
                  <th className="text-center p-3">Avg</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stockStat, index) => {
                  const row = currentData.matrix.find(r => r.stock === stockStat.stock);
                  return (
                    <tr
                      key={stockStat.stock}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer`}
                      onClick={() => setSelectedStock(stockStat.stock)}
                    >
                      <td className="p-3 font-medium">{stockStat.stock}</td>
                      <td className="p-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${getSectorColor(stockStat.sector)}`}>
                          {stockStat.sector}
                        </span>
                      </td>
                      {currentData.periods.map(period => {
                        const returnValue = row[period];
                        return (
                          <td key={period} className="p-1 text-center">
                            {returnValue !== null && returnValue !== undefined ? (
                              <div className={`w-16 h-6 mx-auto rounded flex items-center justify-center ${getReturnColor(returnValue)} ${getReturnTextColor(returnValue)}`}>
                                <span className="text-xs font-bold">{formatReturn(returnValue)}</span>
                              </div>
                            ) : (
                              <div className="w-16 h-6 mx-auto rounded bg-gray-100 flex items-center justify-center">
                                <span className="text-xs text-gray-400">-</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-center font-bold text-green-600">{formatReturn(stockStat.avgReturn)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredStocks.map((stockStat) => (
              <div
                key={stockStat.stock}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedStock(stockStat.stock)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-lg">{stockStat.stock}</div>
                    <span className={`px-2 py-1 rounded text-xs ${getSectorColor(stockStat.sector)}`}>
                      {stockStat.sector}
                    </span>
                    <div className="text-sm text-gray-600 mt-1">
                      Appeared in: {stockStat.periodsAppeared.slice(0, 3).join(', ')}
                      {stockStat.periodsAppeared.length > 3 && ` +${stockStat.periodsAppeared.length - 3} more`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">{formatReturn(stockStat.avgReturn)}</div>
                    <div className="text-sm text-orange-600">Max: {formatReturn(stockStat.maxReturn)}</div>
                    <div className="text-sm text-gray-600">{stockStat.appearances}/{currentData.periods.length} periods</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedStock}</h2>
              <button onClick={() => setSelectedStock(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {(() => {
                const monthlyProcessed = processData(monthlyData);
                const quarterlyProcessed = processData(quarterlyData);
                const yearlyProcessed = processData(yearlyData);

                const allSectors = new Set([
                  ...monthlyProcessed.sectors,
                  ...quarterlyProcessed.sectors,
                  ...yearlyProcessed.sectors
                ]);

                const allStocks = new Set([
                  ...monthlyProcessed.stockStats.map(s => s.stock),
                  ...quarterlyProcessed.stockStats.map(s => s.stock),
                  ...yearlyProcessed.stockStats.map(s => s.stock)
                ]);

                const isSector = allSectors.has(selectedStock) && !allStocks.has(selectedStock);

                if (isSector) {
                  const sectorDetails = getSectorDetails(selectedStock);

                  return (
                    <div>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{sectorDetails.totalAppearances}</div>
                          <div className="text-sm text-gray-600">Total Appearances</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{formatReturn(sectorDetails.overallAvgReturn)}</div>
                          <div className="text-sm text-gray-600">Overall Avg Return</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{formatReturn(sectorDetails.overallMaxReturn)}</div>
                          <div className="text-sm text-gray-600">Best Return</div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Sector</div>
                          <div className="font-semibold">{sectorDetails.sector}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {sectorDetails.stockCount} stocks: {sectorDetails.stocks.join(', ')}
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Performance by Timeframe:</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-blue-100 p-3 rounded-lg text-center">
                            <div className="font-bold text-blue-800">Monthly</div>
                            <div className="text-sm text-gray-600">{sectorDetails.monthlyAppearances} appearances</div>
                            <div className="font-bold text-green-600">
                              {sectorDetails.monthlyAvgReturn ? formatReturn(sectorDetails.monthlyAvgReturn) : 'No data'}
                            </div>
                          </div>
                          <div className="bg-green-100 p-3 rounded-lg text-center">
                            <div className="font-bold text-green-800">Quarterly</div>
                            <div className="text-sm text-gray-600">{sectorDetails.quarterlyAppearances} appearances</div>
                            <div className="font-bold text-green-600">
                              {sectorDetails.quarterlyAvgReturn ? formatReturn(sectorDetails.quarterlyAvgReturn) : 'No data'}
                            </div>
                          </div>
                          <div className="bg-purple-100 p-3 rounded-lg text-center">
                            <div className="font-bold text-purple-800">Yearly</div>
                            <div className="text-sm text-gray-600">{sectorDetails.yearlyAppearances} appearances</div>
                            <div className="font-bold text-green-600">
                              {sectorDetails.yearlyAvgReturn ? formatReturn(sectorDetails.yearlyAvgReturn) : 'No data'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold">All Returns by Period:</h3>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {sectorDetails.allAppearances.map((appearance, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded text-sm">
                              <div>
                                <div className="font-medium">{appearance.period}</div>
                                <div className="text-xs text-gray-600">{appearance.stock}</div>
                                <div className={`text-xs px-2 py-1 rounded ${appearance.timeframe === 'Monthly' ? 'bg-blue-200 text-blue-800' :
                                    appearance.timeframe === 'Quarterly' ? 'bg-green-200 text-green-800' :
                                      'bg-purple-200 text-purple-800'
                                  }`}>
                                  {appearance.timeframe}
                                </div>
                              </div>
                              <span className="font-bold text-green-600">{formatReturn(appearance.return)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {sectorDetails.totalAppearances === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-lg font-medium">No data available</div>
                          <div className="text-sm">This sector does not appear in any timeframe</div>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  const stockDetails = getStockDetails(selectedStock);

                  return (
                    <div>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{stockDetails.totalAppearances}</div>
                          <div className="text-sm text-gray-600">Total Appearances</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{formatReturn(stockDetails.overallAvgReturn)}</div>
                          <div className="text-sm text-gray-600">Overall Avg Return</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{formatReturn(stockDetails.overallMaxReturn)}</div>
                          <div className="text-sm text-gray-600">Best Return</div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">Sector</div>
                          <div className="font-semibold">{stockDetails.sector}</div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Performance by Timeframe:</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-blue-100 p-3 rounded-lg text-center">
                            <div className="font-bold text-blue-800">Monthly</div>
                            <div className="text-sm text-gray-600">{stockDetails.monthlyAppearances} appearances</div>
                            <div className="font-bold text-green-600">
                              {stockDetails.monthlyAvgReturn ? formatReturn(stockDetails.monthlyAvgReturn) : 'No data'}
                            </div>
                          </div>
                          <div className="bg-green-100 p-3 rounded-lg text-center">
                            <div className="font-bold text-green-800">Quarterly</div>
                            <div className="text-sm text-gray-600">{stockDetails.quarterlyAppearances} appearances</div>
                            <div className="font-bold text-green-600">
                              {stockDetails.quarterlyAvgReturn ? formatReturn(stockDetails.quarterlyAvgReturn) : 'No data'}
                            </div>
                          </div>
                          <div className="bg-purple-100 p-3 rounded-lg text-center">
                            <div className="font-bold text-purple-800">Yearly</div>
                            <div className="text-sm text-gray-600">{stockDetails.yearlyAppearances} appearances</div>
                            <div className="font-bold text-green-600">
                              {stockDetails.yearlyAvgReturn ? formatReturn(stockDetails.yearlyAvgReturn) : 'No data'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold">All Returns by Period:</h3>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                          {stockDetails.allAppearances.map((appearance, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded text-sm">
                              <div>
                                <div className="font-medium">{appearance.period}</div>
                                <div className={`text-xs px-2 py-1 rounded ${appearance.timeframe === 'Monthly' ? 'bg-blue-200 text-blue-800' :
                                    appearance.timeframe === 'Quarterly' ? 'bg-green-200 text-green-800' :
                                      'bg-purple-200 text-purple-800'
                                  }`}>
                                  {appearance.timeframe}
                                </div>
                              </div>
                              <span className="font-bold text-green-600">{formatReturn(appearance.return)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {stockDetails.totalAppearances === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-lg font-medium">No data available</div>
                          <div className="text-sm">This stock does not appear in any timeframe</div>
                        </div>
                      )}
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrossTimeframeStockDashboard;