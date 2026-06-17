from django.db import models


class Observacion(models.Model):
    """
    Observaciones libres sobre un expediente (las notas del analista en el detalle).
    ponytail: modelo minimo; el workflow ya guarda comentarios de transicion,
    esto es solo para las notas sueltas que el front permite agregar.
    """
    expediente = models.ForeignKey(
        'expedientes.Expediente', on_delete=models.CASCADE, related_name='observaciones_mvp'
    )
    autor = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    texto = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return f"Obs #{self.pk} exp {self.expediente_id}"
