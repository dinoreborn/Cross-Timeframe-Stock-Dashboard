# Cross-Timeframe Stock Dashboard

A comprehensive stock performance analysis dashboard built with Next.js and React, featuring cross-timeframe insights and advanced sector analysis.

## 🚀 Features

- **Multi-Timeframe Analysis**: Monthly, quarterly, and yearly stock performance tracking
- **Cross-Timeframe Insights**: Identify stocks performing across multiple timeframes
- **Sector Analysis**: Analyze performance trends by sector with heat indicators
- **Interactive Visualizations**: Heat maps and detailed list views
- **Real-time Filtering**: Search, sort, and filter stocks by various criteria
- **Responsive Design**: Works seamlessly on desktop and mobile devices
```

## 🚀 Quick Start

### Deploy to Vercel (Recommended)

1. **Clone or Download** this repository
2. **Push to GitHub** (if not already there)
3. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and deploy!

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
├── app/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   └── CrossTimeframeStockDashboard.js
├── public/
│   └── (static assets)
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## 🎯 Usage

1. **View Data**: Switch between Monthly, Quarterly, Yearly, and Cross-Timeframe views
2. **Add Data**: Click "Add JSON Data" to import your stock performance data
3. **Filter & Search**: Use the search bar and filters to find specific stocks or sectors
4. **Analyze**: Click on any stock or sector for detailed performance breakdown
5. **Export**: Download data and analysis results in JSON format

## 📈 Key Features

### Heat Map View
- Visual representation of stock performance
- Color-coded returns for quick identification
- Sortable by average return, max return, or consistency

### Sector Analysis
- Identify hot, emerging, and cooling sectors
- Cross-timeframe sector performance comparison
- Detailed sector breakdown with stock listings

### Cross-Timeframe Analysis
- Find stocks that perform consistently across timeframes
- Unified view of monthly, quarterly, and yearly performance
- Identify diversification opportunities

## 🔧 Customization

### Adding New Data
1. Prepare your data in JSON format
2. Use the "Add JSON Data" feature
3. Select the appropriate timeframe (Monthly/Quarterly/Yearly)
4. Paste or upload your JSON data

### Modifying Thresholds
- Adjust return percentage filters
- Modify appearance requirements
- Customize sector status thresholds

## 📱 Mobile Responsive

T

For questions or issues:
1. Check the in-app examples and documentation
2. Review the JSON format requirements
3. Test with sample data first

## 🎨 Customization

The app uses Tailwind CSS for styling, making it easy to customize:
- Colors and themes
- Layout and spacing
- Component styling
- Responsive breakpoints

---

