import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, X, RotateCw, Home, Search, Laptop, Cpu, Database, CpuIcon, PlusCircle, Check } from 'lucide-react';
import type { Product } from '../types/os';
import type { UserProfile } from '../components/LoginScreen';
import { getStoredCategories } from './SettingsApp';

interface MarketplaceAppProps {
  onDeployAgentForProduct: (productName: string, maxBudget: number) => void;
  currentUser: UserProfile | null;
  products: Product[];
  onAddProduct: (prod: Product) => void;
  onDeleteProduct?: (prodId: string) => void;
}

export const MarketplaceApp: React.FC<MarketplaceAppProps> = ({
  onDeployAgentForProduct,
  currentUser,
  products,
  onAddProduct,
  onDeleteProduct,
}) => {
  const allCategories = getStoredCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Address Bar navigation history
  const [historyStack, setHistoryStack] = useState<(Product | null)[]>([null]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Form states for listing products
  const [showAddListing, setShowAddListing] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(allCategories[0] || 'Laptops');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [specs, setSpecs] = useState('');
  const [description, setDescription] = useState('');
  const [minAcceptablePrice, setMinAcceptablePrice] = useState('');
  const [image, setImage] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const navigateToProduct = (prod: Product | null) => {
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(prod);
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
    setActiveProduct(prod);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setActiveProduct(historyStack[historyIndex - 1]);
    }
  };

  const handleForward = () => {
    if (historyIndex < historyStack.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setActiveProduct(historyStack[historyIndex + 1]);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryImage = (cat: string) => {
    switch (cat) {
      case 'Laptops':
        return <Laptop className="text-blue-500" size={16} />;
      case 'Hardware':
        return <Cpu className="text-green-500" size={16} />;
      case 'Datasets':
        return <Database className="text-amber-500" size={16} />;
      case 'Agent Services':
      default:
        return <CpuIcon className="text-purple-500" size={16} />;
    }
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) return;

    const listPrice = parseInt(price, 10) || 0;
    const origPrice = parseInt(originalPrice, 10) || Math.floor(listPrice * 1.1);

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      category,
      price: listPrice,
      originalPrice: origPrice,
      specs: specs.trim() || 'No specifications provided.',
      condition: 'Mint (New Listing)',
      sellerAgent: currentUser ? `${currentUser.name.replace(/\s+/g, '')}Agent.exe` : 'SellerAgent.exe',
      sellerName: currentUser ? currentUser.name : 'Independent Merchant',
      sellerTrust: 95,
      image: image || 'default_product_icon',
      description: description.trim() || 'A brand new addition to the AgentBay marketplace directory.',
      minAcceptablePrice: parseInt(minAcceptablePrice, 10) || Math.floor(listPrice * 0.8),
    };

    onAddProduct(newProd);
    setShowAddListing(false);

    // Reset inputs
    setName('');
    setCategory(allCategories[0] || 'Laptops');
    setPrice('');
    setOriginalPrice('');
    setSpecs('');
    setDescription('');
    setMinAcceptablePrice('');
    setImage('');
  };

  return (
    <div className="flex flex-col h-full bg-[#f1efe7] font-sans text-xs select-none relative">
      {/* Dynamic Add Product XP Modal Dialog */}
      {showAddListing && (
        <div className="absolute inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#ece9d8] border-t-4 border-[#0054e3] w-[420px] shadow-2xl"
            style={{ borderRight: '2px solid #555', borderBottom: '2px solid #555' }}
          >
            {/* Title */}
            <div className="xp-titlebar px-2.5 py-1.5 flex items-center justify-between text-xs font-bold">
              <span>➕ Add New Listing — Marketplace Portal</span>
              <button onClick={() => setShowAddListing(false)} className="xp-titlebar-btn xp-titlebar-btn-close w-4 h-4 text-[8px]">✕</button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleCreateListing} className="p-4 space-y-3.5 text-black">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Product Name:</label>
                <input
                  type="text"
                  required
                  className="xp-input w-full text-xs"
                  placeholder="e.g. Athlon 64 Desktop Rig"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Category:</label>
                  <select
                    className="xp-input w-full text-xs bg-white"
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                  >
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">List Price (₹):</label>
                  <input
                    type="number"
                    required
                    className="xp-input w-full text-xs text-right"
                    placeholder="25000"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Original Price (₹):</label>
                  <input
                    type="number"
                    className="xp-input w-full text-xs text-right"
                    placeholder="28000 (Optional)"
                    value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Specs Summary:</label>
                  <input
                    type="text"
                    className="xp-input w-full text-xs"
                    placeholder="e.g. 512MB RAM, 80GB HDD"
                    value={specs}
                    onChange={e => setSpecs(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#b02008] mb-1">Seller Min Price (Floor ₹):</label>
                  <input
                    type="number"
                    className="xp-input w-full text-xs text-right border-red-300"
                    placeholder="e.g. 20000"
                    value={minAcceptablePrice}
                    onChange={e => setMinAcceptablePrice(e.target.value)}
                  />
                  <span className="text-[8px] text-gray-400">Agent won't sell below this</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Hardware Photo:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-[10px]"
                  />
                  {image && <span className="text-[8px] text-green-600 font-bold block mt-1">✓ Photo attached</span>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-1">Description:</label>
                <textarea
                  className="xp-input w-full text-xs h-16 resize-none leading-normal"
                  placeholder="Provide details about condition, tags, performance stats..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-300">
                <button
                  type="button"
                  onClick={() => setShowAddListing(false)}
                  className="xp-btn px-4 py-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1 text-white text-xs font-bold rounded flex items-center gap-1"
                  style={{ background: 'linear-gradient(to bottom, #3cc03c, #227022)' }}
                >
                  <Check size={12} />
                  <span>Publish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IE6 Toolbar Controls */}
      <div className="bg-[#ece9d8] border-b border-[#a0a0a0] flex flex-col gap-0.5 px-1 py-0.5">
        <div className="flex items-center justify-between border-b border-gray-300 pb-1">
          <div className="flex items-center gap-1">
            <button
              onClick={handleBack}
              disabled={historyIndex === 0}
              className={`ie6-btn ${historyIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <ArrowLeft size={16} className="text-blue-800" />
              <span>Back</span>
            </button>
            <button
              onClick={handleForward}
              disabled={historyIndex === historyStack.length - 1}
              className={`ie6-btn ${historyIndex === historyStack.length - 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <ArrowRight size={16} className="text-blue-800" />
              <span>Forward</span>
            </button>
            <button className="ie6-btn" onClick={() => setSelectedCategory('All')}>
              <X size={14} className="text-red-600" />
              <span>Stop</span>
            </button>
            <button className="ie6-btn" onClick={() => window.location.reload()}>
              <RotateCw size={14} className="text-green-600" />
              <span>Refresh</span>
            </button>
            <button onClick={() => navigateToProduct(null)} className="ie6-btn">
              <Home size={14} className="text-blue-600" />
              <span>Home</span>
            </button>
            <div className="w-[1px] h-5 bg-gray-400 mx-1" />
            <button className="ie6-btn" onClick={() => navigateToProduct(null)}>
              <Search size={14} className="text-yellow-600" />
              <span>Search</span>
            </button>
          </div>
          <div className="text-[10px] text-gray-500 font-mono pr-2">Internet Explorer 6</div>
        </div>

        {/* Address Bar */}
        <div className="flex items-center gap-1.5 py-0.5">
          <span className="text-gray-500 font-semibold pl-1">Address</span>
          <div className="flex-1 bg-white border border-[#7f9db9] px-2 py-0.5 flex items-center gap-1.5 font-mono select-text truncate text-[11px] h-[20px]">
            <span className="text-[#008000] text-[10px]">🔒 secure://</span>
            <span>
              www.agentbay.xp/marketplace/
              {activeProduct ? `items/${activeProduct.id}.htm` : 'index.htm'}
            </span>
          </div>
          <button className="xp-btn px-2.5 py-0 border-[#7f9db9] h-[20px] text-[10px] font-bold">Go</button>
        </div>
      </div>

      {/* Main content display */}
      <div className="flex-1 flex overflow-hidden bg-white">
        
        {/* Detail view overlay/switch */}
        {activeProduct ? (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            {/* Breadcrumb path */}
            <div className="text-[10px] text-gray-500 mb-2 flex gap-1 font-mono">
              <span className="cursor-pointer hover:underline text-[#0054e3]" onClick={() => navigateToProduct(null)}>Home</span>
              <span>&gt;</span>
              <span>{activeProduct.category}</span>
              <span>&gt;</span>
              <span>{activeProduct.name}</span>
            </div>

            {/* Main Product Layout */}
            <div className="flex flex-col md:flex-row gap-6 mt-2">
              {/* Product Visual */}
              <div className="w-full md:w-1/3 flex flex-col gap-3">
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-200 border-2 border-gray-300 rounded flex flex-col items-center justify-center p-6 relative shadow-inner overflow-hidden">
                  {activeProduct.image && activeProduct.image !== 'default_product_icon' ? (
                    <img src={activeProduct.image} alt={activeProduct.name} className="w-full h-full object-contain" />
                  ) : (
                    <>
                      {getCategoryImage(activeProduct.category)}
                      <span className="text-sm font-bold text-center mt-2">{activeProduct.name}</span>
                    </>
                  )}
                  
                  {/* Decorative pixel art tag */}
                  <div className="absolute top-2 right-2 bg-yellow-300 border border-yellow-600 px-1 text-[8px] font-bold rounded">
                    HOT RETRO
                  </div>
                </div>
                <div className="border border-[#7f9db9] bg-[#f1efe7] p-2.5 rounded text-[11px]">
                  <div className="font-bold mb-1 text-gray-700">Seller Agent Profile:</div>
                  <div className="flex justify-between">
                    <span>Agent ID:</span>
                    <span className="font-bold font-mono">{activeProduct.sellerAgent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Company:</span>
                    <span className="font-semibold">{activeProduct.sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trust Score:</span>
                    <span className="font-bold text-[#008000]">{activeProduct.sellerTrust}% (Highly Trusted)</span>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <h1 className="text-lg font-black text-black leading-tight border-b-2 border-gray-200 pb-1">
                    {activeProduct.name}
                  </h1>
                  <p className="text-gray-500 italic mt-1">Condition: {activeProduct.condition}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-[#008000]">₹{activeProduct.price.toLocaleString()}</span>
                    <span className="text-gray-400 line-through text-xs">₹{activeProduct.originalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">* Final price negotiable via Client Shopping Agent.</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-gray-700">Key Specifications:</h3>
                  <div className="bg-[#f6f6f0] p-2.5 rounded border border-gray-200 font-mono text-[10px] leading-relaxed text-[#222]">
                    {activeProduct.specs}
                  </div>
                </div>

                <div className="space-y-1 text-[#444] leading-relaxed text-xs">
                  <h3 className="font-bold text-gray-700">Product Description:</h3>
                  <p>{activeProduct.description}</p>
                </div>

                {/* Purchase Button Action */}
                <div className="pt-4 border-t border-gray-200 mt-auto flex gap-3">
                  <button
                    onClick={() => {
                      // Trigger Agent Shopping Flow
                      onDeployAgentForProduct(activeProduct.name, activeProduct.price + 2000);
                    }}
                    className="xp-btn px-6 py-2.5 text-xs font-bold text-[#002d96] flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Deploy Shopping Agent.exe</span>
                  </button>
                  <button
                    onClick={() => navigateToProduct(null)}
                    className="xp-btn px-4 py-2.5 text-xs flex items-center justify-center"
                  >
                    Back to Listings
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this listing?')) {
                          onDeleteProduct?.(activeProduct.id);
                          navigateToProduct(null);
                        }
                      }}
                      className="xp-btn px-4 py-2.5 text-xs text-red-700 border-red-500 bg-[#ffe8e8] flex items-center justify-center font-bold"
                    >
                      Delete Listing
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Main Listings Screen */
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Categories */}
            <div className="w-1/4 bg-[#f6f6f0] border-r border-[#d8d8c8] p-3 flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-[#002d96] border-b border-[#d8d8c8] pb-1 mb-2">Categories</h3>
                <div className="space-y-1">
                  {['All', ...allCategories].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-2 py-1.5 rounded transition ${
                        selectedCategory === cat
                          ? 'bg-[#3f8cf3] text-white font-bold'
                          : 'hover:bg-[#e8e8df] text-gray-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-2 border border-[#d8d8c8] rounded shadow-inner">
                <h4 className="font-bold text-gray-700 mb-1">Search Products:</h4>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="xp-input w-full text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Add Listing trigger for Sellers & Admins */}
              {(currentUser?.role === 'seller' || currentUser?.role === 'admin') && (
                <button
                  onClick={() => setShowAddListing(true)}
                  className="xp-btn w-full py-2 font-bold text-xs flex items-center justify-center gap-1.5 text-green-700 border-green-500 mt-2 bg-[#e8ffe8]"
                >
                  <PlusCircle size={14} />
                  <span>Create Listing</span>
                </button>
              )}
            </div>

            {/* Products Grid */}
            <div className="flex-1 p-3 overflow-y-auto bg-white flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                <span className="font-bold text-gray-800 text-xs">
                  Showing {filteredProducts.length} listings in Category: <span className="text-[#0054e3] font-black">{selectedCategory}</span>
                </span>
              </div>

              {/* Product Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigateToProduct(p)}
                    className="border border-[#c0c0c0] rounded bg-[#fafafa] hover:bg-[#ffeec2] hover:border-[#f0c0b0] cursor-pointer p-3 flex flex-col gap-2 transition"
                  >
                    {/* Thumbnail box */}
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded flex items-center justify-center p-3 text-2xl relative shadow-inner border border-gray-200 overflow-hidden">
                      {p.image && p.image !== 'default_product_icon' ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      ) : (
                        getCategoryImage(p.category)
                      )}
                    </div>
                    {/* Title */}
                    <div>
                      <h4 className="font-bold text-black text-xs leading-snug truncate" title={p.name}>
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-mono">Seller: {p.sellerName}</p>
                    </div>
                    {/* Prices */}
                    <div className="flex justify-between items-baseline mt-auto border-t border-gray-100 pt-1.5">
                      <span className="font-bold text-[#008000]">₹{p.price.toLocaleString()}</span>
                      <span className="text-gray-400 line-through text-[9px]">₹{p.originalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center p-8 text-gray-500 italic">
                  No listings found matching filters. Try adjusting categories or search terms.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
