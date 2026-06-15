import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

export default function App() {
  const [products, setProducts] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data);
  }

  async function addProduct() {
    if (!nombre || !precio) return;

    const precioNumerico = Number(
      precio.replace(/\./g, "")
    );

    const { error } = await supabase
      .from("productos")
      .insert([
        {
          nombre,
          precio: precioNumerico,
        },
      ]);

    if (error) {
      console.error(error);
      return;
    }

    setNombre("");
    setPrecio("");

    loadProducts();
  }

  const formatCOP = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");

    if (!rawValue) {
      setPrecio("");
      return;
    }

    setPrecio(
      Number(rawValue).toLocaleString("es-CO")
    );
  };

  const filteredProducts = products.filter((product) =>
    product.nombre
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const printPriceList = () => {
    const content = `
      <html>
      <head>
        <title>Lista de Precios</title>

        <style>
          body{
            font-family: Arial, sans-serif;
            padding:40px;
          }

          h1{
            text-align:center;
            margin-bottom:30px;
          }

          .item{
            display:flex;
            justify-content:space-between;
            padding:8px 0;
            border-bottom:1px dotted #ccc;
            font-size:18px;
          }

          .price{
            font-weight:bold;
          }
        </style>
      </head>

      <body>

        <h1>CAFETERÍA</h1>

        ${products
          .map(
            (p) => `
            <div class="item">
              <span>${p.nombre}</span>
              <span class="price">
                ${formatCOP(p.precio)}
              </span>
            </div>
          `
          )
          .join("")}

      </body>
      </html>
    `;

    const win = window.open("", "_blank");

    win.document.write(content);
    win.document.close();

    setTimeout(() => {
      win.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-6">
          ☕ Cafetería
        </h1>

        <div className="bg-white p-5 rounded-xl shadow mb-6">

          <h2 className="font-semibold text-xl mb-4">
            Agregar Producto
          </h2>

          <input
            className="w-full border p-3 rounded mb-3"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
          />

          <input
            className="w-full border p-3 rounded mb-3"
            placeholder="Precio"
            value={precio}
            onChange={handlePriceChange}
          />

          <div className="flex gap-2">

            <button
              onClick={addProduct}
              className="bg-black text-white px-5 py-3 rounded"
            >
              Guardar Producto
            </button>

            <button
              onClick={printPriceList}
              className="bg-green-600 text-white px-5 py-3 rounded"
            >
              🖨 Imprimir Lista de Precios
            </button>

          </div>

        </div>

        <input
          className="w-full border p-3 rounded mb-6"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <div className="grid md:grid-cols-2 gap-4">

          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded-xl shadow"
            >
              <h3 className="font-bold text-lg">
                {product.nombre}
              </h3>

              <p className="text-green-700 font-semibold">
                {formatCOP(product.precio)}
              </p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}