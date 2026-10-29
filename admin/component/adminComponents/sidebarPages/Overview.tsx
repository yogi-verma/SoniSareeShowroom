import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiBox,
  FiCalendar,
  FiChevronDown,
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";

const weeklySales = [
  { day: "Mon", amount: 42 },
  { day: "Tue", amount: 68 },
  { day: "Wed", amount: 54 },
  { day: "Thu", amount: 82 },
  { day: "Fri", amount: 61 },
  { day: "Sat", amount: 94 },
  { day: "Sun", amount: 74 },
];

const recentOrders = [
  { id: "#SS-2084", customer: "Ananya Mehta", item: "Banarasi Silk Saree", amount: "₹12,500", status: "Delivered" },
  { id: "#SS-2083", customer: "Priya Shah", item: "Kanjivaram Silk Saree", amount: "₹18,900", status: "Processing" },
  { id: "#SS-2082", customer: "Isha Patel", item: "Chiffon Floral Saree", amount: "₹4,200", status: "Shipped" },
  { id: "#SS-2081", customer: "Meera Joshi", item: "Bandhani Georgette Saree", amount: "₹6,750", status: "Processing" },
];

const topCategories = [
  { name: "Banarasi Silk", units: 48, share: 82, color: "bg-plum" },
  { name: "Kanjivaram Silk", units: 36, share: 63, color: "bg-gold" },
  { name: "Bandhani", units: 29, share: 49, color: "bg-[#a56c8f]" },
  { name: "Cotton Sarees", units: 21, share: 35, color: "bg-[#7b8794]" },
];

const metrics = [
  { label: "Total revenue", value: "₹2,48,500", change: "+12.8%", up: true, icon: FiTrendingUp, note: "vs. previous month" },
  { label: "Orders", value: "186", change: "+8.2%", up: true, icon: FiShoppingBag, note: "vs. previous month" },
  { label: "Average order value", value: "₹1,336", change: "+3.4%", up: true, icon: FiBox, note: "vs. previous month" },
  { label: "Pending orders", value: "12", change: "4 need attention", up: false, icon: FiPackage, note: "ready to process" },
];

export default function Overview({ adminName }: { adminName: string }) {
  return (
    <div id="overview">

      <h1>This is overview</h1>
    </div>
  );
}
