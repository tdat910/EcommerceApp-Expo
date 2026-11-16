import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { dummyProducts } from "../../assets/assets";
import { Order, Product, User } from "../../constants/types";

type StoredUser = User & { password: string };
export type CartEntry = { productId: string; quantity: number; size: string };
export type StoreOrder = Omit<Order, "user"> & { user: string };

type StoreData = {
    users: StoredUser[];
    products: Product[];
    categories: string[];
    orders: StoreOrder[];
    cart: Record<string, CartEntry[]>;
    favorites: Record<string, string[]>;
    currentUserId: string | null;
};

type PublicUser = Omit<User, "createdAt"> & { createdAt: string };

type AppStoreContextValue = {
    ready: boolean;
    loadError: string | null;
    user: PublicUser | null;
    users: PublicUser[];
    products: Product[];
    categories: string[];
    orders: StoreOrder[];
    cart: CartEntry[];
    favorites: string[];
    login: (email: string, password: string) => Promise<PublicUser>;
    register: (name: string, email: string, password: string) => Promise<PublicUser>;
    logout: () => Promise<void>;
    updateProfile: (values: Pick<User, "name" | "email" | "phone" | "address">) => Promise<void>;
    addToCart: (productId: string, size: string) => Promise<void>;
    setCartQuantity: (productId: string, size: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string, size: string) => Promise<void>;
    toggleFavorite: (productId: string) => Promise<void>;
    placeOrder: (address: NonNullable<User["address"]>) => Promise<StoreOrder>;
    saveProduct: (product: Partial<Product> & Pick<Product, "name" | "price" | "category">, id?: string) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    saveCategory: (name: string, previousName?: string) => Promise<void>;
    deleteCategory: (name: string) => Promise<void>;
    changeUserRole: (id: string, role: User["role"]) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    updateOrderStatus: (id: string, status: StoreOrder["orderStatus"]) => Promise<void>;
};

const STORAGE_KEY = "forever-store-v1";
const ADMIN_EMAIL = "admin@forever.com";
const ADMIN_PASSWORD = "Admin123!";

const seedData = (): StoreData => {
    const products = Array.from(new Map((dummyProducts as Product[]).map((product) => [product._id, product])).values());
    return {
        users: [{
            _id: "seed-admin",
            name: "Store Admin",
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: "admin",
            createdAt: new Date().toISOString(),
        }],
        products,
        categories: Array.from(new Set(products.map((product) => categoryName(product.category)))),
        orders: [],
        cart: {},
        favorites: {},
        currentUserId: null,
    };
};

const categoryName = (category: Product["category"]) =>
    typeof category === "string" ? category : category.name;

const publicUser = ({ password: _password, ...user }: StoredUser): PublicUser => user;

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<StoreData>(() => seedData());
    const [ready, setReady] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const dataRef = useRef(data);

    useEffect(() => {
        let mounted = true;
        const initialize = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                const initial = stored ? { ...seedData(), ...JSON.parse(stored) } as StoreData : seedData();
                initial.products = Array.from(new Map(initial.products.map((product) => [product._id, product])).values());
                if (!initial.users.some((entry) => entry.email.toLowerCase() === ADMIN_EMAIL)) {
                    initial.users.push(seedData().users[0]);
                }
                dataRef.current = initial;
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
                if (mounted) {
                    setData(initial);
                    setReady(true);
                }
            } catch (error) {
                console.error("Could not initialize the local store.", error);
                if (mounted) {
                    setLoadError("Your store data could not be loaded. Please restart the app.");
                    setReady(true);
                }
            }
        };
        void initialize();
        return () => { mounted = false; };
    }, []);

    const updateData = async (update: (current: StoreData) => StoreData) => {
        const next = update(dataRef.current);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        dataRef.current = next;
        setData(next);
    };

    const value = useMemo<AppStoreContextValue>(() => {
        const currentUser = data.currentUserId
            ? data.users.find((entry) => entry._id === data.currentUserId)
            : undefined;
        return {
            ready,
            loadError,
            user: currentUser ? publicUser(currentUser) : null,
            users: data.users.map(publicUser),
            products: data.products,
            categories: data.categories,
            orders: data.orders,
            cart: currentUser ? data.cart[currentUser._id] ?? [] : [],
            favorites: currentUser ? data.favorites[currentUser._id] ?? [] : [],
            login: async (email, password) => {
                const account = dataRef.current.users.find((entry) => entry.email.toLowerCase() === email.trim().toLowerCase() && entry.password === password);
                if (!account) throw new Error("Email or password is incorrect.");
                await updateData((current) => ({ ...current, currentUserId: account._id }));
                return publicUser(account);
            },
            register: async (name, email, password) => {
                const normalizedEmail = email.trim().toLowerCase();
                if (dataRef.current.users.some((entry) => entry.email.toLowerCase() === normalizedEmail)) {
                    throw new Error("An account with this email already exists.");
                }
                const account: StoredUser = {
                    _id: `user-${Date.now()}`,
                    name: name.trim(),
                    email: normalizedEmail,
                    password,
                    role: "user",
                    createdAt: new Date().toISOString(),
                };
                await updateData((current) => ({
                    ...current,
                    users: [...current.users, account],
                    currentUserId: account._id,
                }));
                return publicUser(account);
            },
            logout: () => updateData((current) => ({ ...current, currentUserId: null })),
            updateProfile: async (values) => {
                if (!currentUser) throw new Error("Sign in to update your profile.");
                const normalizedEmail = values.email.trim().toLowerCase();
                if (!values.name.trim() || !normalizedEmail.includes("@")) {
                    throw new Error("Enter a name and a valid email address.");
                }
                if (dataRef.current.users.some((entry) => entry._id !== currentUser._id && entry.email.toLowerCase() === normalizedEmail)) {
                    throw new Error("An account with this email already exists.");
                }
                await updateData((current) => ({
                    ...current,
                    users: current.users.map((entry) => entry._id === currentUser._id
                        ? { ...entry, ...values, email: normalizedEmail }
                        : entry),
                }));
            },
            addToCart: async (productId, size) => {
                if (!currentUser) throw new Error("Sign in before adding items to your cart.");
                const product = dataRef.current.products.find((entry) => entry._id === productId);
                if (!product || !product.isActive) throw new Error("This product is no longer available.");
                const entries = dataRef.current.cart[currentUser._id] ?? [];
                const existing = entries.find((entry) => entry.productId === productId && entry.size === size);
                if ((existing?.quantity ?? 0) >= product.stock) throw new Error("There is not enough stock for this quantity.");
                await updateData((current) => ({
                    ...current,
                    cart: {
                        ...current.cart,
                        [currentUser._id]: existing
                            ? entries.map((entry) => entry.productId === productId && entry.size === size
                                ? { ...entry, quantity: entry.quantity + 1 }
                                : entry)
                            : [...entries, { productId, size, quantity: 1 }],
                    },
                }));
            },
            setCartQuantity: async (productId, size, quantity) => {
                if (!currentUser) throw new Error("Sign in to update your cart.");
                const product = dataRef.current.products.find((entry) => entry._id === productId);
                if (!product) throw new Error("This product is no longer available.");
                if (quantity > product.stock) throw new Error(`Only ${product.stock} item(s) are available.`);
                await updateData((current) => ({
                    ...current,
                    cart: {
                        ...current.cart,
                        [currentUser._id]: (current.cart[currentUser._id] ?? [])
                            .map((entry) => entry.productId === productId && entry.size === size
                                ? { ...entry, quantity }
                                : entry)
                            .filter((entry) => entry.quantity > 0),
                    },
                }));
            },
            removeFromCart: async (productId, size) => {
                if (!currentUser) return;
                await updateData((current) => ({
                    ...current,
                    cart: {
                        ...current.cart,
                        [currentUser._id]: (current.cart[currentUser._id] ?? [])
                            .filter((entry) => entry.productId !== productId || entry.size !== size),
                    },
                }));
            },
            toggleFavorite: async (productId) => {
                if (!currentUser) throw new Error("Sign in to save favorites.");
                const favorites = dataRef.current.favorites[currentUser._id] ?? [];
                await updateData((current) => ({
                    ...current,
                    favorites: {
                        ...current.favorites,
                        [currentUser._id]: favorites.includes(productId)
                            ? favorites.filter((id) => id !== productId)
                            : [...favorites, productId],
                    },
                }));
            },
            placeOrder: async (address) => {
                if (!currentUser) throw new Error("Sign in to place an order.");
                const cart = dataRef.current.cart[currentUser._id] ?? [];
                if (!cart.length) throw new Error("Your cart is empty.");
                const items = cart.map((entry) => {
                    const product = dataRef.current.products.find((item) => item._id === entry.productId);
                    if (!product || product.stock < entry.quantity) throw new Error(`${product?.name ?? "A product"} no longer has enough stock.`);
                    return { product: product._id, name: product.name, quantity: entry.quantity, price: product.price, image: product.images[0], size: entry.size };
                });
                const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
                const order: StoreOrder = {
                    _id: `order-${Date.now()}`,
                    user: currentUser._id,
                    orderNumber: `ORD-${Date.now()}`,
                    items,
                    shippingAddress: address,
                    paymentMethod: "cash on delivery",
                    paymentStatus: "pending",
                    orderStatus: "placed",
                    subtotal,
                    shippingCost: subtotal >= 100 ? 0 : 5,
                    tax: 0,
                    totalAmount: subtotal + (subtotal >= 100 ? 0 : 5),
                    createdAt: new Date().toISOString(),
                };
                await updateData((current) => ({
                    ...current,
                    orders: [order, ...current.orders],
                    cart: { ...current.cart, [currentUser._id]: [] },
                    products: current.products.map((product) => {
                        const purchased = items.find((item) => item.product === product._id);
                        return purchased ? { ...product, stock: product.stock - purchased.quantity } : product;
                    }),
                }));
                return order;
            },
            saveProduct: async (product, id) => {
                const name = product.name.trim();
                if (!name || !Number.isFinite(product.price) || product.price < 0) {
                    throw new Error("Enter a product name and a valid price.");
                }
                const category = categoryName(product.category);
                await updateData((current) => {
                    const existing = id ? current.products.find((item) => item._id === id) : undefined;
                    const saved: Product = {
                        _id: id ?? `product-${Date.now()}`,
                        name,
                        description: product.description?.trim() ?? "",
                        price: product.price,
                        comparePrice: product.comparePrice,
                        images: product.images?.length ? product.images : ["https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800"],
                        sizes: product.sizes?.length ? product.sizes : ["One size"],
                        category,
                        stock: Math.max(0, product.stock ?? 0),
                        ratings: existing?.ratings ?? { average: 0, count: 0 },
                        isFeatured: product.isFeatured ?? false,
                        isActive: product.isActive ?? true,
                        createdAt: existing?.createdAt ?? new Date().toISOString(),
                    };
                    return {
                        ...current,
                        products: existing
                            ? current.products.map((item) => item._id === id ? saved : item)
                            : [saved, ...current.products],
                        categories: current.categories.includes(category) ? current.categories : [...current.categories, category],
                    };
                });
            },
            deleteProduct: async (id) => updateData((current) => ({
                ...current,
                products: current.products.filter((item) => item._id !== id),
                cart: Object.fromEntries(Object.entries(current.cart).map(([userId, entries]) => [
                    userId,
                    entries.filter((entry) => entry.productId !== id),
                ])),
            })),
            saveCategory: async (name, previousName) => {
                const cleanName = name.trim();
                if (!cleanName) throw new Error("Enter a category name.");
                await updateData((current) => {
                    const exists = current.categories.some((item) => item.toLowerCase() === cleanName.toLowerCase() && item !== previousName);
                    if (exists) throw new Error("That category already exists.");
                    return {
                        ...current,
                        categories: previousName
                            ? current.categories.map((item) => item === previousName ? cleanName : item)
                            : [...current.categories, cleanName],
                        products: previousName
                            ? current.products.map((item) => categoryName(item.category) === previousName ? { ...item, category: cleanName } : item)
                            : current.products,
                    };
                });
            },
            deleteCategory: async (name) => {
                if (dataRef.current.products.some((item) => categoryName(item.category) === name)) {
                    throw new Error("Move or delete this category's products before deleting it.");
                }
                await updateData((current) => ({ ...current, categories: current.categories.filter((item) => item !== name) }));
            },
            changeUserRole: async (id, role) => {
                const target = dataRef.current.users.find((entry) => entry._id === id);
                const adminCount = dataRef.current.users.filter((entry) => entry.role === "admin").length;
                if (target?.role === "admin" && role !== "admin" && adminCount <= 1) {
                    throw new Error("The last administrator must remain an administrator.");
                }
                await updateData((current) => ({
                    ...current,
                    users: current.users.map((entry) => entry._id === id ? { ...entry, role } : entry),
                }));
            },
            deleteUser: async (id) => {
                const admins = dataRef.current.users.filter((entry) => entry.role === "admin");
                if (admins.length <= 1 && admins[0]?._id === id) throw new Error("The last administrator cannot be deleted.");
                if (dataRef.current.currentUserId === id) throw new Error("You cannot delete the account currently in use.");
                await updateData((current) => ({
                    ...current,
                    users: current.users.filter((entry) => entry._id !== id),
                    cart: Object.fromEntries(Object.entries(current.cart).filter(([userId]) => userId !== id)),
                    favorites: Object.fromEntries(Object.entries(current.favorites).filter(([userId]) => userId !== id)),
                }));
            },
            updateOrderStatus: async (id, status) => updateData((current) => ({
                ...current,
                orders: current.orders.map((order) => order._id === id ? { ...order, orderStatus: status } : order),
            })),
        };
    }, [data, ready, loadError]);

    return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
    const context = useContext(AppStoreContext);
    if (!context) throw new Error("useAppStore must be used inside AppStoreProvider.");
    return context;
}
