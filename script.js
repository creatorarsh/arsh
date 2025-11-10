
// Product price lookup
const priceMap = {101:139900,102:119900,103:39900,104:24900,105:44900,106:18900,107:3990,108:5990};
let cart = {};

function formatINR(n){ return n.toLocaleString('en-IN'); }
function updateCartUI(){ document.getElementById('cartCount').innerText = Object.values(cart).reduce((s,n)=>s+n,0); }
function saveCart(){ localStorage.setItem('demo_cart', JSON.stringify(cart)); }
function loadCart(){ cart = JSON.parse(localStorage.getItem('demo_cart')||'{}'); updateCartUI(); }

document.addEventListener('DOMContentLoaded',()=>{
  loadCart();
  document.querySelectorAll('.btn-add').forEach(b=> b.addEventListener('click',()=>{
    const id = parseInt(b.dataset.id);
    cart[id] = (cart[id]||0)+1; saveCart(); updateCartUI(); showToast('Added to cart');
  }));

  const cartModalEl = document.getElementById('cartModal'); const bsCartModal = new bootstrap.Modal(cartModalEl);
  document.getElementById('cartBtn').addEventListener('click',()=>{ renderCartModal(); bsCartModal.show(); });

  document.getElementById('checkoutBtn').addEventListener('click',()=>{
    renderCartModal();
    bsCartModal.hide();
    const payModalEl = document.getElementById('payModal'); const bsPayModal = new bootstrap.Modal(payModalEl);
    bsPayModal.show();
  });

  document.getElementById('payNowBtn').addEventListener('click',()=>{
    const form = document.getElementById('paymentForm'); if(!form.checkValidity()){ form.reportValidity(); return; }
    // simulate success popup
    const payModal = bootstrap.Modal.getInstance(document.getElementById('payModal')); payModal.hide();
    // clear cart
    cart = {}; saveCart(); updateCartUI();
    showPaymentSuccess();
  });

  document.getElementById('searchInput').addEventListener('input',(e)=>{
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('#productsRow .col-sm-6').forEach(col=>{
      const name = col.querySelector('.product-name').innerText.toLowerCase();
      col.style.display = name.includes(q) ? '' : 'none';
    });
  });

  document.querySelectorAll('.category').forEach(btn=> btn.addEventListener('click',()=>{
    document.querySelectorAll('.category').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    // simple mapping: phones -> iphone, laptops -> macbook, wearables -> watch, audio -> airpods, tablets -> ipad, accessories -> magsafe/case
    document.querySelectorAll('#productsRow .col-sm-6').forEach(col=>{
      const name = col.querySelector('.product-name').innerText.toLowerCase();
      if(cat==='all') col.style.display=''; else {
        const map = {phones:['iphone'],'laptops':['macbook'],'wearables':['watch'],'audio':['airpods'],'tablets':['ipad'],'accessories':['magsafe','case']};
        const matches = map[cat].some(k=> name.includes(k));
        col.style.display = matches ? '' : 'none';
      }
    });
  }));
});

function renderCartModal(){
  const body = document.getElementById('cartBody'); body.innerHTML='';
  const keys = Object.keys(cart); if(keys.length===0){ body.innerHTML='<p>Your cart is empty.</p>'; document.getElementById('cartTotal').innerText='0'; return; }
  const table = document.createElement('table'); table.className='table'; table.innerHTML='<thead><tr><th>Product</th><th>Qty</th><th>Price</th><th></th></tr></thead>';
  const tbody = document.createElement('tbody'); let total=0;
  for(const k of keys){
    const id = parseInt(k); const qty = cart[k]; const name = document.querySelector('[data-id="'+id+'"]').closest('.card').querySelector('.product-name').innerText;
    const price = priceMap[id]; const tr = document.createElement('tr');
    tr.innerHTML = `<td>${name}</td><td>${qty}</td><td>₹ ${formatINR(price*qty)}</td><td><button class="btn btn-sm btn-outline-danger remove" data-id="${id}">Remove</button></td>`;
    tbody.appendChild(tr); total += price*qty;
  }
  table.appendChild(tbody); body.appendChild(table); document.getElementById('cartTotal').innerText = formatINR(total);
  body.querySelectorAll('.remove').forEach(b=> b.addEventListener('click',()=>{ delete cart[b.dataset.id]; saveCart(); renderCartModal(); updateCartUI(); }));
}

function showToast(msg){
  const t = document.createElement('div'); t.className='toast align-items-center text-bg-dark border-0'; t.style.position='fixed'; t.style.right='20px'; t.style.bottom='20px'; t.style.zIndex=9999; t.style.padding='10px 14px'; t.innerText = msg; document.body.appendChild(t);
  setTimeout(()=> t.classList.add('show'),50); setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); },1500);
}

function showPaymentSuccess(){
  // small modal-like popup
  const el = document.createElement('div'); el.style.position='fixed'; el.style.left='50%'; el.style.top='30%'; el.style.transform='translateX(-50%)'; el.style.background='#fff'; el.style.padding='20px 24px'; el.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'; el.style.borderRadius='10px'; el.style.zIndex=99999;
  el.innerHTML = '<div style="font-size:22px;font-weight:700;margin-bottom:8px;">✅ Payment Successful</div><div style="color:#555;margin-bottom:12px;">Thank you for your order — this is a demo payment.</div><div style="text-align:right"><button id="okPay" class="btn btn-sm btn-primary">Done</button></div>';
  document.body.appendChild(el);
  document.getElementById('okPay').addEventListener('click',()=> el.remove());
}
