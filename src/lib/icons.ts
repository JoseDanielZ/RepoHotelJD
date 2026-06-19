import { cssInterop } from 'nativewind';
import {
  AlertCircle, AlertTriangle, ArrowLeft, ArrowRight,
  BedDouble, Building2, Calendar, CalendarCheck, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  ChevronUp, CreditCard, DollarSign, Edit, Eye, FileText,
  Filter, Home, Hotel, Info, KeyRound, Layers, LayoutDashboard,
  Lock, LogIn, LogOut, Mail, MapPin, Menu, MoreHorizontal, Phone,
  Plus, Receipt, RefreshCw, Search, Settings, Shield, ShoppingBag,
  Sliders, Star, Tag, Trash2, TrendingUp, User, Users, UserCheck,
  UserPlus, Wallet, X, XCircle, Clock, Banknote,
} from 'lucide-react-native';

const iconStyle = { className: { target: 'style', nativeStyleToProp: { color: true } } } as const;

const icons = [
  AlertCircle, AlertTriangle, ArrowLeft, ArrowRight,
  BedDouble, Building2, Calendar, CalendarCheck, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  ChevronUp, CreditCard, DollarSign, Edit, Eye, FileText,
  Filter, Home, Hotel, Info, KeyRound, Layers, LayoutDashboard,
  Lock, LogIn, LogOut, Mail, MapPin, Menu, MoreHorizontal, Phone,
  Plus, Receipt, RefreshCw, Search, Settings, Shield, ShoppingBag,
  Sliders, Star, Tag, Trash2, TrendingUp, User, Users, UserCheck,
  UserPlus, Wallet, X, XCircle, Clock, Banknote,
];

icons.forEach((Icon) => cssInterop(Icon, iconStyle));

export {
  AlertCircle, AlertTriangle, ArrowLeft, ArrowRight,
  BedDouble, Building2, Calendar, CalendarCheck, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight,
  ChevronUp, CreditCard, DollarSign, Edit, Eye, FileText,
  Filter, Home, Hotel, Info, KeyRound, Layers, LayoutDashboard,
  Lock, LogIn, LogOut, Mail, MapPin, Menu, MoreHorizontal, Phone,
  Plus, Receipt, RefreshCw, Search, Settings, Shield, ShoppingBag,
  Sliders, Star, Tag, Trash2, TrendingUp, User, Users, UserCheck,
  UserPlus, Wallet, X, XCircle, Clock, Banknote,
};
